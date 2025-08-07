// src/utils/orderCleanupService.js

const cron = require('node-cron');
const moment = require('moment');
const {logger} = require('../config/logger');
const db = require('../../models');

// تابع برای پاکسازی سفارشات منقضی
exports.cleanExpiredOrders = async () => {
    logger.info('Running expired orders cleanup job...');

    const t = await db.sequelize.transaction(); // استفاده از تراکنش

    try {
        const twentyFourHoursAgo = moment().subtract(24, 'hours').toDate();

        // 1. یافتن سفارشات "pending" که بیش از 24 ساعت از ایجادشان گذشته است
        const expiredOrders = await db.Order.findAll({
            where: {
                status: ['pending', 'pending_payment_gateway'], // وضعیت‌هایی که باید بررسی شوند
                createdAt: { [db.Sequelize.Op.lte]: twentyFourHoursAgo }
            },
            include: [{
                model: db.OrderItem,
                as: 'orderItems',
                include: [{ model: db.Product, as: 'product' }]
            }],
            transaction: t
        });

        if (expiredOrders.length === 0) {
            logger.info('No expired pending orders found.');
            await t.commit();
            return;
        }

        logger.info(`Found ${expiredOrders.length} expired pending orders.`);

        for (const order of expiredOrders) {
            // 2. تغییر وضعیت سفارش به "expired"
            const oldStatus = order.status;
            order.status = 'expired'; // یا 'cancelled_by_system'
            order.payment_status = 'failed'; // وضعیت پرداخت را نیز به ناموفق تغییر دهید
            logger.info(`Order ${order.id} - Status ${oldStatus} changed to ${order.status} by system due to expired order.`);
            await order.save({ transaction: t });

            // 3. بازگرداندن موجودی محصولات به انبار
            for (const item of order.orderItems) {
                const product = await db.Product.findByPk(item.product_id, { transaction: t });
                if (product) {
                    const oldStock = product.stock_quantity;
                    product.stock_quantity += item.quantity; // افزایش موجودی
                    await product.save({ transaction: t });

                    // 👈 ثبت لاگ در InventoryLog برای بازگشت موجودی
                    await db.InventoryLog.create({
                        product_id: product.id,
                        change_type: 'expired_order_return',
                        quantity_change: item.quantity, // مقدار افزایش موجودی
                        old_stock_quantity: oldStock,
                        new_stock_quantity: product.stock_quantity,
                        changed_by_user_id: null, // توسط سیستم
                        description: `Inventory returned from expired order ${order.id}.`
                    }, { transaction: t });
                }
            }

            // 👈 ثبت لاگ در OrderHistory برای تغییر وضعیت سفارش
            await db.OrderHistory.create({
                order_id: order.id,
                status: 'expired',
                changed_at: new Date(),
                changed_by: null, // توسط سیستم
                description: 'Order expired and cancelled by system.'
            }, { transaction: t });

            logger.info(`Order ${order.id} expired and stock returned.`);
        }

        await t.commit();
        logger.info('Expired orders cleanup job completed successfully.');

    } catch (error) {
        await t.rollback();
        logger.error(`Error during expired orders cleanup: ${error.message}`, { stack: error.stack });
    }
};

// 👈 راه‌اندازی زمان‌بندی Cron Job
exports.startExpiredOrderCleanupScheduler = () => {
    // زمان‌بندی: مثلاً هر 1 ساعت (0 * * * *) یا هر 24 ساعت (0 0 * * *)
    // برای تست، می‌توانید آن را هر چند دقیقه تنظیم کنید.
    cron.schedule('0 * * * *', async () => { // هر ساعت (0 دقیقه از هر ساعت)
        logger.info('Triggering expired order cleanup.');
        await exports.cleanExpiredOrders();
    });
    logger.info('Expired order cleanup scheduler started.');
};