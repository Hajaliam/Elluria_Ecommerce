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
const { sanitizeString } = require('../utils/sanitizer');

// تابع برای نهایی کردن خرید از سبد خرید و ایجاد سفارش
exports.placeOrder = async (req, res) => {
  const { shippingAddressId, couponCode } = req.body;
  const userId = req.user ? req.user.id : null;
  const sessionId = req.cookies ? req.cookies.session_id : null;

  if (!userId && !sessionId) {
    return res
      .status(400)
      .json({
        message: 'User ID or Session ID is required to place an order.',
      });
  }

  const t = await db.sequelize.transaction(); // شروع یک تراکنش دیتابیس

  try {
    // 1. دریافت سبد خرید کاربر
    const cart = await Cart.findOne({
      where: userId ? { user_id: userId } : { session_id: sessionId },
      include: [
        {
          model: CartItem,
          as: 'cartItems',
          include: [
            {
              model: Product,
              as: 'product',
            },
          ],
        },
      ],
      transaction: t, // شامل کردن در تراکنش
    });

    if (!cart || cart.cartItems.length === 0) {
      await t.rollback(); // اگر سبد خرید خالی بود، تراکنش را برگردان
      return res
        .status(400)
        .json({ message: 'Cart is empty. Cannot place an order.' });
    }

    // 2. بررسی آدرس ارسال
    const shippingAddress = await Address.findByPk(shippingAddressId, {
      transaction: t,
    });
    if (!shippingAddress || (userId && shippingAddress.user_id !== userId)) {
      await t.rollback();
      return res
        .status(404)
        .json({
          message: 'Shipping address not found or does not belong to you.',
        });
    }

    // 3. بررسی و اعمال کوپن (اگر وجود داشت)
    let coupon = null;
    let discountAmount = 0;
    if (couponCode) {
      coupon = await Coupon.findOne({
        where: { code: couponCode, isActive: true },
        transaction: t,
      });
      if (!coupon) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: 'Invalid or expired coupon code.' });
      }
      if (
        coupon.usage_limit !== null &&
        coupon.used_count >= coupon.usage_limit
      ) {
        await t.rollback();
        return res.status(400).json({ message: 'Coupon usage limit reached.' });
      }
    }

    // 4. محاسبه کل مبلغ سفارش و بررسی موجودی محصولات
    let totalAmount = 0;
    const orderItemsData = [];
    for (const item of cart.cartItems) {
      const product = item.product;

      if (!product || product.stock_quantity < item.quantity) {
        await t.rollback();
        return res
          .status(400)
          .json({
            message: `Not enough stock for product: ${product ? product.name : 'Unknown Product'} (Available: ${product ? product.stock_quantity : 0})`,
          });
      }

      totalAmount += item.quantity * product.price;

      orderItemsData.push({
        product_id: product.id,
        quantity: item.quantity,
        price_at_purchase: product.price, // ذخیره قیمت در زمان خرید
      });

      // کاهش موجودی محصول
      product.stock_quantity -= item.quantity;
      await product.save({ transaction: t }); // ذخیره تغییرات موجودی در تراکنش
    }

    // بررسی حداقل مبلغ برای کوپن
    if (coupon && totalAmount < coupon.min_amount) {
      await t.rollback();
      return res
        .status(400)
        .json({
          message: `Coupon requires a minimum order amount of ${coupon.min_amount}.`,
        });
    }

    // 5. اعمال تخفیف کوپن
    if (coupon) {
      if (coupon.discount_type === 'percentage') {
        discountAmount = totalAmount * (coupon.discount_value / 100);
      } else if (coupon.discount_type === 'fixed_amount') {
        discountAmount = coupon.discount_value;
      }
      totalAmount -= discountAmount;
      if (totalAmount < 0) totalAmount = 0; // اطمینان از عدم منفی شدن قیمت

      // افزایش تعداد استفاده شده کوپن
      coupon.used_count += 1;
      await coupon.save({ transaction: t });
    }

    // 6. ایجاد سفارش جدید در جدول Orders
    const newOrder = await Order.create(
      {
        user_id: userId,
        total_amount: totalAmount.toFixed(2),
        status: 'pending', // وضعیت اولیه سفارش
        shipping_address_id: shippingAddressId,
        payment_status: 'unpaid', // وضعیت اولیه پرداخت
        coupon_id: coupon ? coupon.id : null, // اضافه کردن کوپن استفاده شده
      },
      { transaction: t },
    );

    // 7. ایجاد آیتم‌های سفارش در جدول OrderItems
    for (const itemData of orderItemsData) {
      await OrderItem.create(
        {
          order_id: newOrder.id,
          product_id: itemData.product_id,
          quantity: itemData.quantity,
          price_at_purchase: itemData.price_at_purchase,
        },
        { transaction: t },
      );
    }

    // 8. پاک کردن سبد خرید پس از ایجاد سفارش موفق
    await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });
    await cart.destroy({ transaction: t }); // حذف خود سبد خرید نیز

    // 9. انجام تراکنش
    await t.commit();

    res
      .status(201)
      .json({ message: 'Order placed successfully!', order: newOrder });
  } catch (error) {
    await t.rollback(); // در صورت بروز خطا، تراکنش را برگردان
    console.error('Error placing order:', error);
    res
      .status(500)
      .json({ message: 'Server error placing order', error: error.message });
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
        return res
          .status(403)
          .json({
            message:
              'Access Denied: You are not authorized to view this order.',
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
    res
      .status(500)
      .json({
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
      return res
        .status(403)
        .json({
          message:
            'Access Denied: You are not authorized to cancel this order.',
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
      const product = await Product.findByPk(item.product_id, {
        transaction: t,
      });
      if (product) {
        product.stock_quantity += item.quantity;
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
