// src/controllers/paymentController.js

const db = require('../../models');
const { Order } = db;
const { logger } = require('../config/logger'); // برای لاگ‌گیری
const paymentService = require('../services/paymentService');

function redactCallbackRequestFromLogging(req) {
    const callbackPath = `${req.baseUrl || ''}${req.path}`;
    req.originalUrl = callbackPath;
    req.url = req.path;
    Object.defineProperty(req, 'query', {
        value: Object.freeze({}),
        configurable: true,
        enumerable: true,
    });
}

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
    redactCallbackRequestFromLogging(req);
    if (Status !== 'OK') {
        logger.warn('Payment callback rejected.', {
            error: { code: 'CALLBACK_STATUS_REJECTED' },
            statusCode: 400,
        });
        return res.status(400).json({ message: 'Payment failed or cancelled by user.' });
    }

    try {
        const result = await paymentService.verifyAndFinalize({
            database: req.app.locals.database,
            paymentAdapter: req.app.locals.adapters && req.app.locals.adapters.payment,
            authority: Authority,
            callbackOrderId: orderId,
        });
        const { order, payment, alreadyFinalized } = result;
        logger.info('Payment callback completed.', {
            paymentId: payment.id,
            orderId: order.id,
            alreadyFinalized,
        });
        res.status(200).json({
            message: alreadyFinalized ? 'Order already paid.' : 'Payment verified and order finalized.',
            orderId: order.id,
            paymentId: payment.id
        });

    } catch (error) {
        if (error instanceof paymentService.PaymentCallbackError) {
            logger.warn('Payment callback rejected.', {
                error: { code: error.code },
                statusCode: error.statusCode,
            });
            return res.status(error.statusCode).json({ message: error.message });
        }
        logger.error('Unexpected payment callback error.', { stack: error.stack });
        res.status(500).json({ message: 'Server error verifying payment.' });
    }
};
