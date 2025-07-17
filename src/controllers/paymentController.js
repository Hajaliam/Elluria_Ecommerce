// src/controllers/paymentController.js

const db = require('../../models');
const Order = db.Order;
const Payment = db.Payment;
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
    // در یک سیستم واقعی، این‌ها از درگاه پرداخت می‌آیند
    // مثلاً از query parameters یا body درخواست POST
    const { Authority, Status, orderId } = req.query; // برای زرین‌پال Authority و Status می‌آید

    // این یک شبیه‌سازی ساده است. در واقعیت، باید اعتبار Authority را چک کنید.
    if (Status !== 'OK') {
        logger.warn(`Payment verification failed for Order ID: ${orderId}. Status: ${Status}`);
        // اینجا می‌توانید کاربر را به صفحه‌ی ناموفق پرداخت هدایت کنید
        return res.status(400).json({ message: 'Payment failed or cancelled by user.' });
    }

    // تراکنش دیتابیس برای به‌روزرسانی اتمیک
    const t = await db.sequelize.transaction();

    try {
        const order = await Order.findByPk(orderId, { transaction: t });

        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found for payment verification.' });
        }

        if (order.payment_status === 'paid') {
            await t.rollback();
            return res.status(200).json({ message: 'Order already paid.', orderId: order.id });
        }

        // 1. به‌روزرسانی وضعیت سفارش
        order.payment_status = 'paid';
        order.status = 'processing'; // سفارش وارد مرحله پردازش می‌شود
        await order.save({ transaction: t });

        // 2. ایجاد رکورد پرداخت در جدول Payment
        const payment = await Payment.create({
            order_id: order.id,
            transaction_id: Authority, // Authority زرین‌پال به عنوان Transaction ID
            amount: order.total_amount,
            method: 'Zarinpal', // یا هر روش دیگری
            status: 'success',
            payment_date: new Date(),
            refunded: false,
            refund_reason: null
        }, { transaction: t });

        logger.info(`Payment successful for Order ID: ${order.id}. Transaction ID: ${Authority}`);

        // TODO: ارسال ایمیل/پیامک تأیید خرید به مشتری
        // TODO: ثبت لاگ‌های اضافی در صورت نیاز

        await t.commit();
        // اینجا کاربر را به صفحه‌ی موفقیت‌آمیز پرداخت در فرانت‌اند هدایت می‌کنیم
        res.status(200).json({ message: 'Payment verified and order updated successfully!', orderId: order.id, paymentId: payment.id });

    } catch (error) {
        await t.rollback();
        logger.error(`Error verifying payment for order ${orderId}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error verifying payment', error: error.message });
    }
};
