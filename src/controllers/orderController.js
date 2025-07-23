// src/controllers/orderController.js

const db = require('../../models');
const Cart = db.Cart;
const CartItem = db.CartItem;
const Product = db.Product;
const Order = db.Order;
const OrderItem = db.OrderItem;
const Address = db.Address; // برای بررسی آدرس ارسال
const Coupon = db.Coupon; // برای اعمال کوپن
const Sequelize = db.Sequelize;
const { Op } = require('sequelize');
const { sanitizeString } = require('../utils/sanitizer');
const logger = require('../config/logger');

let oldStock


// تابع برای نهایی کردن خرید از سبد خرید و ایجاد سفارش
// controllers/orderController.js
exports.placeOrder = async (req, res) => {
  const userId = req.user.id;
  const {shippingAddressId , couponCode} = req.body;
  const t = await db.sequelize.transaction();

  try {
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: {
        model: CartItem,
        as: 'cartItems',
        include: ['product']
      },
      transaction: t
    });

    if (!cart || cart.cartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // محاسبه قیمت کل
    let totalAmount = 0;
    let totalDiscount = 0;
    let shippingCost = 10; // 👈 هزینه ارسال پیش‌فرض
    const orderItemsData = [];

    for (const item of cart.cartItems) {
      totalAmount += parseFloat(item.product.price) * item.quantity;
    }
    let coupon = null;
    // 3. اعتبارسنجی و اعمال کوپن (اگر وجود داشت)
    if (couponCode) {
      coupon = await db.Coupon.findOne({
        where: { code: couponCode, isActive: true },
        include: [
          { model: db.CouponProduct, as: 'couponProducts' },
          { model: db.UserCoupon, as: 'userCoupons' }
        ],
        transaction: t
      });

      if (!coupon) {
        await t.rollback();
        return res.status(400).json({ message: 'Invalid or expired coupon.' });
      }

      // بررسی محدودیت استفاده برای هر کاربر بدون افزایش شمارش
      if (coupon.max_usage_per_user !== null) {
        const userUsage = await db.UserCouponUsage.findOne({
          where: { user_id: userId, coupon_id: coupon.id },
          transaction: t
        });

        if (userUsage && userUsage.usage_count >= coupon.max_usage_per_user) {
          await t.rollback();
          return res.status(400).json({ message: 'You have reached the usage limit for this coupon.' });
        }
      }

      // بررسی حداقل مبلغ سفارش
      if (coupon.min_amount && totalAmount < coupon.min_amount) {
        await t.rollback();
        return res.status(400).json({ message: `This coupon requires a minimum order amount of ${coupon.min_amount}.` });
      }

      // کوپن مخصوص خرید اول
      if (coupon.is_first_purchase_only) {
        const existingOrders = await db.Order.count({
          where: {
            user_id: userId ,
            status: {
              [Op.ne]: 'cancelled'
            }
          },
          transaction: t,
        });
        if (existingOrders > 0) {
          await t.rollback();
          return res.status(400).json({ message: 'This coupon is for first-time purchases only.' });
        }
      }

      // کوپن خصوصی برای کاربر خاص
      if (coupon.userCoupons?.length > 0) {
        const isUserAllowed = coupon.userCoupons.some(uc => uc.user_id === userId);
        if (!isUserAllowed) {
          await t.rollback();
          return res.status(400).json({ message: 'This coupon is private and not assigned to your account.' });
        }
      }

      // کوپن مخصوص محصولات خاص

      let allowedCartItems = cart.cartItems;

      if (coupon.couponProducts?.length > 0) {
        console.log("I'm running ...")
        const allowedProductIds = coupon.couponProducts.map(cp => cp.product_id);
        console.log(allowedProductIds)
        console.log("All cart items product_ids:", cart.cartItems.map(i => i.product_id));
        allowedCartItems = cart.cartItems.filter(item =>
            allowedProductIds.includes(item.product_id)
        );

        if (allowedCartItems.length === 0) {
          await t.rollback();
          return res.status(400).json({ message: 'This coupon is not valid for any products in your cart.' });
        }
      }

      // محاسبه تخفیف
      if (coupon.discount_type === 'percentage') {
        const eligibleAmount = allowedCartItems.reduce((sum, item) => {
          return sum + parseFloat(item.product.price) * item.quantity;
        }, 0);
        totalDiscount = (eligibleAmount * parseFloat(coupon.discount_value)) / 100;
      } else if (coupon.discount_type === 'fixed_amount') {
        totalDiscount = parseFloat(coupon.discount_value);

      } else if (coupon.discount_type === 'free_shipping') {
        shippingCost = 0;
        totalDiscount = 0;
        logger.info(`Free shipping coupon applied. Shipping cost set to 0`);
      }

      // جلوگیری از تخفیف بیشتر از مبلغ کل
      if (totalDiscount > totalAmount) {
        totalDiscount = totalAmount;
      }

    }
    let finalAmount = totalAmount - totalDiscount + shippingCost;
    console.log("Final Amount: ", finalAmount);
    console.log("Total Discount: ", totalDiscount);
    console.log("total amount: ", totalAmount);
    if (finalAmount < 0)  finalAmount = 0;

    ///بروز رسانی یا ایجاد سفارش

    let newOrder = await db.Order.findOne({
      where: {
        user_id: userId,
        payment_status: "unpaid",
        status: "pending"
      },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (newOrder) {
      await newOrder.update({
        shipping_address_id: shippingAddressId,
        coupon_id: coupon?.id || null,
        total_amount: finalAmount
      }, { transaction: t });

    }

    if (!newOrder) {
      newOrder = await db.Order.create({
        user_id: userId,
        status: 'pending',
        shipping_address_id: shippingAddressId,
        coupon_id: coupon?.id || null,
        payment_status: 'unpaid',
        total_amount: finalAmount
      }, { transaction: t });

    }
    // رزرو انبار (کاهش موجودی موقت و ثبت لاگ)
    for (const item of cart.cartItems) {
      const product = await Product.findByPk(item.product_id, { transaction: t });
      const isReservedItem = await db.InventoryLog.findOne({
          where: {
            product_id: product.id,
            order_id: newOrder.id,
            change_type : "reserve"
          },
          transaction: t})
      if (!product || product.stock_quantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Insufficient stock for product ${product?.name || item.product_id}` });
      }

      const oldStock = product.stock_quantity;
      if(!isReservedItem) {
        orderItemsData.push({
          product_id: product.id,
          quantity: item.quantity,
          price_at_purchase: product.price // ذخیره قیمت در زمان خرید
        });
        product.stock_quantity -= item.quantity;
      }
      await product.save({ transaction: t });


      await db.InventoryLog.findOrCreate({
        where: {
          product_id: product.id,
          order_id: newOrder.id,
          change_type: 'reserve'
        },
        defaults: {
          quantity_change: -item.quantity,
          old_stock_quantity: oldStock,
          new_stock_quantity: product.stock_quantity,
          changed_by_user_id: userId,
          description: `Order ${newOrder.id} - Reserved ${item.quantity} units of ${product.id} for unpaid order.`
        },
        transaction: t
      });
      // await db.InventoryLog.create({
      //   product_id: product.id,
      //   order_id : newOrder.id,
      //   change_type: 'reserve',
      //   quantity_change: -item.quantity,
      //   old_stock_quantity: oldStock,
      //   new_stock_quantity: product.stock_quantity,
      //   changed_by_user_id: userId,
      //   description: `Order ${newOrder.id} - Reserved ${item.quantity} units of ${product.id} for unpaid order.`,
      // }, { transaction: t });
      //
    }
    for (const itemData of orderItemsData) {
      await OrderItem.create({
        order_id: newOrder.id,
        product_id: itemData.product_id,
        quantity: itemData.quantity,
        price_at_purchase: itemData.price_at_purchase
      }, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      message: 'Order placed and stock reserved. Awaiting payment...',
      orderId: newOrder.id,
      totalAmount : finalAmount,
    });

  } catch (error) {
    await t.rollback();
    logger.error('Error placing order:', error);
    res.status(500).json({ message: 'Server error placing order', error: error.message });
  }
};

// تابع برای دریافت جزئیات یک سفارش
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;

  try {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'price', 'image_url'],
            },
          ],
        },
        { model: Address, as: 'shippingAddress' },
        {
          model: Coupon,
          as: 'coupon',
          attributes: ['code', 'discount_type', 'discount_value'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // اگر کاربر ادمین نیست، مطمئن شویم سفارش متعلق به خودش است
    const userRole = req.user ? await db.Role.findByPk(req.user.role_id) : null;
    if (!userRole || userRole.name !== 'admin') {
      if (order.user_id !== userId) {
        return res.status(403).json({
          message: 'Access Denied: You are not authorized to view this order.',
        });
      }
    }

    res.status(200).json({ order: order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res
      .status(500)
      .json({ message: 'Server error fetching order', error: error.message });
  }
};

// تابع برای دریافت همه سفارشات (فقط برای ادمین) یا سفارشات یک کاربر خاص
exports.getAllOrders = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const userRole = req.user ? await db.Role.findByPk(req.user.role_id) : null;

  let whereClause = {};

  // اگر کاربر ادمین نیست، فقط سفارشات خودش را ببیند
  if (!userRole || userRole.name !== 'admin') {
    if (!userId) {
      return res
        .status(403)
        .json({ message: 'Access Denied: Please log in to view your orders.' });
    }
    whereClause.user_id = userId;
  }

  // اگر کاربر ادمین است، فیلترها را از query params دریافت می‌کنیم
  if (userRole && userRole.name === 'admin') {
    const { user_id, status, payment_status } = req.query;

    // اضافه کردن فیلترهای اختیاری به whereClause
    if (user_id) {
      whereClause.user_id = user_id;
    }
    if (status) {
      whereClause.status = status;
    }
    if (payment_status) {
      whereClause.payment_status = payment_status;
    }
  }

  try {
    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            { model: Product, as: 'product', attributes: ['name', 'price'] },
          ],
        },
        { model: db.User, as: 'user', attributes: ['username', 'email'] },
      ],
      order: [['createdAt', 'DESC']], // مرتب‌سازی بر اساس جدیدترین
    });
    res.status(200).json({ orders: orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res
      .status(500)
      .json({ message: 'Server error fetching orders', error: error.message });
  }
};

// تابع برای به‌روزرسانی وضعیت سفارش (فقط برای ادمین)
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  let { status } = req.body; // 👈 از let استفاده کنید

  // 👈 اعمال پاکسازی
  status = sanitizeString(status);

  const userId = req.user ? req.user.id : null;

  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // می‌توانید یک لیست از وضعیت‌های مجاز تعریف کنید و ورودی را اعتبارسنجی کنید
    const allowedStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: 'Invalid order status provided.' });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // ثبت تغییر وضعیت در تاریخچه سفارشات
    await db.OrderHistory.create({
      order_id: order.id,
      status: status,
      changed_by: userId,
      changed_at: new Date(),
    });

    res
      .status(200)
      .json({ message: 'Order status updated successfully!', order: order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      message: 'Server error updating order status',
      error: error.message,
    });
  }
};

// تابع برای لغو سفارش (توسط کاربر یا ادمین)
exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;
  const userRole = req.user ? await db.Role.findByPk(req.user.role_id) : null;

  const t = await db.sequelize.transaction();

  try {
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'orderItems' }],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (!userRole || (userRole.name !== 'admin' && order.user_id !== userId)) {
      await t.rollback();
      return res.status(403).json({
        message: 'Access Denied: You are not authorized to cancel this order.',
      });
    }

    if (
      order.status === 'delivered' ||
      order.status === 'cancelled' ||
      order.status === 'refunded'
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: `Cannot cancel order in status: ${order.status}` });
    }

    for (const item of order.orderItems) {
      console.log("item exist in line : ",444)
      const product = await Product.findByPk(item.product_id, {
        transaction: t,
      });
      if (product) {
        let oldStock = product.stock_quantity
        product.stock_quantity += item.quantity;
        await db.InventoryLog.create({
          product_id: product.id,
          change_type: 'Order_Canceled',
          quantity_change: item.quantity,
          old_stock_quantity: oldStock,
          new_stock_quantity: product.stock_quantity,
          changed_by_user_id: req.user.id, // کاربر تغییر دهنده
          description: `Product ${product.id}  returned to inventory ${item.quantity} units .`
        });
        await product.save({ transaction: t });
      }
    }

    if (order.coupon_id) {
      const coupon = await Coupon.findByPk(order.coupon_id, { transaction: t });
      if (coupon) {
        coupon.used_count -= 1;
        await coupon.save({ transaction: t });
      }
    }

    order.status = 'cancelled'; // 👈 این هم باید پاکسازی شود (اگر از ورودی کاربر می‌آید)
    await order.save({ transaction: t });

    await db.OrderHistory.create(
      {
        order_id: order.id,
        status: 'cancelled', // 👈 این هم باید پاکسازی شود (اگر از ورودی کاربر می‌آید)
        changed_by: userId,
        changed_at: new Date(),
      },
      { transaction: t },
    );

    await t.commit();
    res
      .status(200)
      .json({ message: 'Order cancelled successfully!', order: order });
  } catch (error) {
    await t.rollback();
    console.error('Error cancelling order:', error);
    res
      .status(500)
      .json({ message: 'Server error cancelling order', error: error.message });
  }
};
