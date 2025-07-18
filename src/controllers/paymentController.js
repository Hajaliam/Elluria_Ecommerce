// src/controllers/paymentController.js

const db = require('../../models');
const { Order, Payment, OrderItem, Product, Cart, CartItem, InventoryLog } = db;
const logger = require('../config/logger'); // برای لاگ‌گیری
const { sanitizeString } = require('../utils/sanitizer');

// تابع برای آغاز فرآیند پرداخت
// این تابع در واقع یک شبیه‌سازی برای هدایت به درگاه پرداخت است
exports.initiatePayment = async (req, res) => {
    const { orderId } = req.body;
    const userId = req.user.id; // کاربر باید احراز هویت شده باشد

    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        if (order.user_id !== userId && req.user.role_id !== 2) { // فرض می‌کنیم ادمین هم بتواند پرداخت را آغاز کند
            console.log('User role:', req.user.role_id);
            return res.status(403).json({ message: 'Access Denied: You are not authorized to pay for this order.' });
        }
        if (order.payment_status === 'paid' ) {
            return res.status(400).json({ message: 'Order has already been paid .' });
        }
        if ( order.status === 'cancelled') {
            return res.status(400).json({ message: 'Order has already been  cancelled.' });
        }

        // 👈 شبیه‌سازی هدایت به درگاه پرداخت زرین‌پال
        // در یک سیستم واقعی، اینجا یک درخواست به API زرین‌پال ارسال می‌شود
        // و کاربر به URL دریافتی از زرین‌پال هدایت می‌شود.
        const simulatedPaymentGatewayUrl = `http://zarinpal.com/pg/StartPay/${order.total_amount}/${order.id}`;

        // به‌روزرسانی وضعیت پرداخت سفارش به 'pending'
        order.payment_status = 'pending_payment_gateway';
        await order.save();

        logger.info(`Payment initiated for Order ID: ${orderId}. Redirecting to simulated gateway.`);
        res.status(200).json({
            message: 'Payment initiation successful. Redirecting to payment gateway.',
            paymentGatewayUrl: simulatedPaymentGatewayUrl,
            orderId: orderId
        });

    } catch (error) {
        logger.error(`Error initiating payment for order ${orderId}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error initiating payment', error: error.message });
    }
};

// تابع برای تأیید پرداخت (Callback از درگاه پرداخت)
// این روت توسط درگاه پرداخت (مثلاً زرین‌پال) فراخوانی می‌شود
exports.verifyPayment = async (req, res) => {
    const { Authority, Status, orderId } = req.query;

    if (Status !== 'OK') {
        logger.warn(`Payment verification failed for Order ID: ${orderId}. Status: ${Status}`);
        return res.status(400).json({ message: 'Payment failed or cancelled by user.' });
    }

    const t = await db.sequelize.transaction();

    try {
        const order = await Order.findByPk(orderId, { transaction: t });

        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found.' });
        }

        if (order.payment_status === 'paid') {
            await t.rollback();
            return res.status(200).json({ message: 'Order already paid.', orderId: order.id });
        }

        // 1. به‌روزرسانی وضعیت سفارش
        order.payment_status = 'paid';
        order.status = 'processing';
        await order.save({ transaction: t });

        // 2. ثبت پرداخت
        const payment = await Payment.create({
            order_id: order.id,
            transaction_id: Authority,
            amount: order.total_amount,
            method: 'Zarinpal',
            status: 'success',
            payment_date: new Date(),
            refunded: false,
            refund_reason: null
        }, { transaction: t });

        // 3. دریافت آیتم‌های سبد خرید هنگام سفارش
        const cart = await Cart.findOne({
            where: { user_id: order.user_id },
            include: {
                model: CartItem,
                as: 'cartItems',
                include: ['product']
            },
            transaction: t
        });

        if (!cart || cart.cartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'No cart items found for this user.' });
        }

        // 4. ثبت OrderItems و افزایش sold_count
        for (const item of cart.cartItems) {
            const product = await Product.findByPk(item.product_id, { transaction: t });

            if (!product) {
                await t.rollback();
                return res.status(404).json({ message: `Product with ID ${item.product_id} not found.` });
            }

            // ثبت آیتم سفارش
            await OrderItem.create({
                order_id: order.id,
                product_id: product.id,
                quantity: item.quantity,
                price_at_purchase: parseFloat(product.price),
            }, { transaction: t });

            // افزایش sold_count
            const oldSoldCount = product.sold_count || 0;
            console.log("OldSold Count", oldSoldCount);
            product.sold_count = oldSoldCount + item.quantity;
            console.log("NewSold Count", product.sold_count);
            await product.save({ transaction: t });

            // ثبت لاگ فروش در موجودی
            await InventoryLog.create({
                product_id: product.id,
                change_type: 'sold',
                quantity_change: -item.quantity,
                old_stock_quantity: product.stock_quantity + item.quantity, // چون توی placeOrder کم شده
                new_stock_quantity: product.stock_quantity,
                changed_by_user_id: order.user_id,
                description: `Sold ${item.quantity} units for order ${order.id}`
            }, { transaction: t });
        }

        //5. به روزرسانی تعداد استفاده از کوپن در صورت وجود
        if (order.coupon_id) {
            const coupon = await db.Coupon.findByPk(order.coupon_id , { transaction: t });
            if (coupon && coupon.max_usage_per_user !== null) {
                const [userUsage, created] = await db.UserCouponUsage.findOrCreate({
                    where: { user_id: order.user_id, coupon_id: coupon.id },
                    defaults: { usage_count: 1 },
                    transaction: t
                });

                if (!created) {
                    await userUsage.increment('usage_count', { by: 1, transaction: t });
                }
            }
            // کاهش محدودیت کلی کوپن (نه کاربر)
            if (coupon.usage_limit !== null) {
                coupon.usage_limit -= 1;
                await coupon.save({ transaction: t });
            }
        }

        // TODO: ایمیل یا پیامک تایید برای کاربر

        await t.commit();

        logger.info(`✅ Payment verified and order finalized. Order ID: ${order.id}, Tx ID: ${Authority}`);
        res.status(200).json({
            message: 'Payment verified and order finalized.',
            orderId: order.id,
            paymentId: payment.id
        });

    } catch (error) {
        await t.rollback();
        logger.error(`Error verifying payment for order ${orderId}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error verifying payment', error: error.message });
    }
};
