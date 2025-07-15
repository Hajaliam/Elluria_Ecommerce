// src/controllers/cartController.js

const db = require('../../models');
const Cart = db.Cart;
const CartItem = db.CartItem;
const Product = db.Product;
const Sequelize = db.Sequelize;
const { v4: uuidv4 } = require('uuid'); // برای تولید session_id منحصر به فرد

// تابع کمکی برای دریافت یا ایجاد سبد خرید کاربر
// این تابع حالا req و res را به عنوان آرگومان می‌گیرد تا بتواند کوکی‌ها را مدیریت کند
const getOrCreateCart = async (req, res) => {
  // 👈 اینجا باید req و res را دریافت کند
  let userId = req.user ? req.user.id : null; // از JWT (اگر توکن معتبر بود)
  let sessionId = req.cookies ? req.cookies.session_id : null; // از کوکی‌ها

  let cart;

  if (userId) {
    // اگر کاربر لاگین کرده است:
    cart = await Cart.findOne({ where: { user_id: userId } });

    // اگر کاربر لاگین کرده بود و قبلاً یک سبد خرید مهمان داشت، آن را به سبد خرید لاگین شده منتقل کنید
    // این برای سناریوهایی است که کاربر مهمان با سبد خرید لاگین می‌کند
    if (sessionId && !cart) {
      const guestCart = await Cart.findOne({
        where: { session_id: sessionId },
      });
      if (guestCart) {
        guestCart.user_id = userId;
        guestCart.session_id = null; // session_id را پاک می‌کنیم چون به کاربر لاگین شده تعلق گرفت
        await guestCart.save();
        cart = guestCart;
        res.clearCookie('session_id'); // کوکی session_id را از مرورگر کاربر پاک می‌کنیم
      }
    }
  } else {
    // اگر کاربر مهمان است:
    if (!sessionId) {
      sessionId = uuidv4(); // تولید session_id جدید
      // تنظیم session_id در کوکی پاسخ برای مرورگر کاربر
      res.cookie('session_id', sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 روز اعتبار
        httpOnly: true, // از دسترس جاوااسکریپت سمت کلاینت خارج می‌شود
        // secure: process.env.NODE_ENV === 'production', // در محیط پروداکشن برای HTTPS فعال شود
        sameSite: 'Lax', // یا 'None' اگر از دامنه‌های مختلف استفاده می‌کنید و secure فعال است
      });
    }
    // پیدا کردن سبد خرید بر اساس session_id
    cart = await Cart.findOne({ where: { session_id: sessionId } });
  }

  // اگر هنوز سبد خریدی پیدا نشد (کاربر جدید یا سشن جدید)
  if (!cart) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // انقضا 7 روز آینده

    cart = await Cart.create({
      user_id: userId || null,
      session_id: sessionId || null,
      expires_at: expiresAt,
    });
  }
  return { cart, sessionId }; // هم سبد خرید و هم session_id (اگر جدید تولید شد) را برمی‌گرداند
};

// تابع برای افزودن محصول به سبد خرید
exports.addItemToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const { cart, sessionId } = await getOrCreateCart(req, res); // 👈 req و res را پاس می‌دهیم

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ message: 'Not enough product in stock.' });
    }

    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id: productId },
    });

    if (cartItem) {
      // اگر آیتم قبلاً در سبد خرید بود، تعداد را افزایش بده
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // اگر آیتم جدید بود، اضافه کن
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id: productId,
        quantity: quantity,
      });
    }

    // به‌روزرسانی زمان انقضای سبد خرید با هر تغییر
    cart.expires_at = new Date(new Date().setDate(new Date().getDate() + 7)); // 👈 اصلاح: همیشه از زمان فعلی 7 روز اضافه شود
    await cart.save();

    res
      .status(200)
      .json({
        message: 'Item added to cart successfully!',
        cartItem: cartItem,
        sessionId: sessionId,
      });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res
      .status(500)
      .json({
        message: 'Server error adding item to cart',
        error: error.message,
      });
  }
};

// تابع برای دریافت محتویات سبد خرید
exports.getCart = async (req, res) => {
  try {
    const { cart, sessionId } = await getOrCreateCart(req, res); // 👈 req و res را پاس می‌دهیم

    const cartDetails = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'cartItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: [
                'id',
                'name',
                'price',
                'image_url',
                'stock_quantity',
              ],
            },
          ],
        },
      ],
    });

    let totalAmount = 0;
    let items = cartDetails.cartItems.map((item) => {
      const product = item.product;
      let status = 'available';
      if (product.stock_quantity < item.quantity) {
        status = 'out_of_stock_partial';
      } else if (product.stock_quantity === 0) {
        status = 'out_of_stock_full';
      }
      totalAmount += item.quantity * product.price;

      return {
        cartItemId: item.id,
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image_url: product.image_url,
        stock_available: product.stock_quantity,
        status: status,
      };
    });

    res.status(200).json({
      cartId: cart.id,
      userId: cart.user_id,
      sessionId: cart.session_id,
      expiresAt: cart.expires_at,
      totalItems: items.length,
      totalAmount: totalAmount.toFixed(2),
      items: items,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res
      .status(500)
      .json({ message: 'Server error fetching cart', error: error.message });
  }
};

// تابع برای به‌روزرسانی تعداد یک آیتم در سبد خرید
exports.updateCartItemQuantity = async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    return res
      .status(400)
      .json({
        message: 'Quantity must be positive. Use delete to remove item.',
      });
  }

  try {
    const { cart } = await getOrCreateCart(req, res); // 👈 req و res را پاس می‌دهیم

    let cartItem = await CartItem.findOne({
      where: { id: cartItemId, cart_id: cart.id }, // اطمینان از تعلق آیتم به سبد خرید فعلی
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['stock_quantity'],
        },
      ],
    });

    if (!cartItem) {
      return res
        .status(404)
        .json({
          message:
            'Cart item not found or does not belong to your current cart.',
        });
    }

    if (cartItem.product.stock_quantity < quantity) {
      return res
        .status(400)
        .json({
          message: `Not enough product in stock. Available: ${cartItem.product.stock_quantity}`,
        });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    cart.expires_at = new Date(new Date().setDate(new Date().getDate() + 7)); // 👈 اصلاح: همیشه از زمان فعلی 7 روز اضافه شود
    await cart.save();

    res
      .status(200)
      .json({
        message: 'Cart item quantity updated successfully!',
        cartItem: cartItem,
      });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res
      .status(500)
      .json({
        message: 'Server error updating cart item quantity',
        error: error.message,
      });
  }
};

// تابع برای حذف یک آیتم از سبد خرید
exports.removeItemFromCart = async (req, res) => {
  const { cartItemId } = req.params;

  try {
    const { cart } = await getOrCreateCart(req, res); // 👈 req و res را پاس می‌دهیم

    const cartItem = await CartItem.findOne({
      where: { id: cartItemId, cart_id: cart.id }, // اطمینان از تعلق آیتم به سبد خرید فعلی
    });

    if (!cartItem) {
      return res
        .status(404)
        .json({
          message:
            'Cart item not found or does not belong to your current cart.',
        });
    }

    await cartItem.destroy();

    cart.expires_at = new Date(new Date().setDate(new Date().getDate() + 7)); // 👈 اصلاح: همیشه از زمان فعلی 7 روز اضافه شود
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart successfully!' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res
      .status(500)
      .json({
        message: 'Server error removing item from cart',
        error: error.message,
      });
  }
};

// تابع برای پاک کردن کل سبد خرید
exports.clearCart = async (req, res) => {
  try {
    const { cart } = await getOrCreateCart(req, res); // 👈 req و res را پاس می‌دهیم

    await CartItem.destroy({
      where: { cart_id: cart.id },
    });

    cart.expires_at = new Date(new Date().setDate(new Date().getDate() + 7)); // 👈 اصلاح: همیشه از زمان فعلی 7 روز اضافه شود
    await cart.save();

    res.status(200).json({ message: 'Cart cleared successfully!' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res
      .status(500)
      .json({ message: 'Server error clearing cart', error: error.message });
  }
};
