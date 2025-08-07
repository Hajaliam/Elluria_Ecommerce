// src/controllers/shippingController.js

const db = require('../../models');
const Order = db.Order;
const ShipmentTracking = db.ShipmentTracking;
const {logger} = require('../config/logger');
const { sanitizeString } = require('../utils/sanitizer');

// 👈 تابع برای ایجاد یک رکورد ردیابی ارسال جدید (POST)
exports.createShipmentTracking = async (req, res) => {
    const { orderId, provider_name, tracking_code, status, estimated_delivery_date } = req.body;
    const adminUserId = req.user.id; // ادمینی که این کار را انجام می‌دهد

    const t = await db.sequelize.transaction();

    try {
        // اعتبارسنجی: وجود سفارش
        const order = await Order.findByPk(orderId, { transaction: t });
        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found.' });
        }

        // اعتبارسنجی: عدم تکرار رکورد ردیابی برای این سفارش (اگر از قبل بود)
        const existingShipment = await ShipmentTracking.findOne({ where: { order_id: orderId }, transaction: t });
        if (existingShipment) {
            await t.rollback();
            return res.status(409).json({ message: 'Shipment tracking already exists for this order. Use PUT to update.' });
        }

        // پاکسازی ورودی‌ها
        const sanitizedProviderName = sanitizeString(provider_name);
        const sanitizedTrackingCode = tracking_code ? sanitizeString(tracking_code) : null;
        const sanitizedStatus = sanitizeString(status);

        const newShipment = await ShipmentTracking.create({
            order_id: orderId,
            provider_name: sanitizedProviderName,
            tracking_code: sanitizedTrackingCode,
            status: sanitizedStatus,
            estimated_delivery_date: estimated_delivery_date ? new Date(estimated_delivery_date) : null,
            last_update_date: new Date()
        }, { transaction: t });

        // به‌روزرسانی وضعیت سفارش اصلی
        order.status = sanitizedStatus;
        await order.save({ transaction: t });

        // ثبت لاگ در OrderHistory
        await db.OrderHistory.create({
            order_id: order.id,
            status: sanitizedStatus,
            changed_at: new Date(),
            changed_by: adminUserId,
            description: `Shipment tracking created and status set to '${sanitizedStatus}'.`
        }, { transaction: t });

        await t.commit();
        logger.info(`Shipment tracking created for Order ID: ${orderId}. Status: ${sanitizedStatus}.`);
        res.status(201).json({
            message: 'Shipment tracking created successfully!',
            shipmentTracking: newShipment
        });

    } catch (error) {
        await t.rollback();
        logger.error(`Error creating shipment tracking for order ${orderId}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error creating shipment tracking', error: error.message });
    }
};

// 👈 تابع برای به‌روزرسانی وضعیت ارسال سفارش (PUT)
exports.updateShippingStatus = async (req, res) => {
    const { orderId } = req.params;
    const { provider_name, tracking_code, status, estimated_delivery_date } = req.body;

    // 👈 **اعتبارسنجی ورودی‌های ضروری**
    if (!provider_name) {
        return res.status(400).json({ message: 'Provider name is required.' });
    }
    if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
    }

    const sanitizedProviderName = sanitizeString(provider_name);
    const sanitizedTrackingCode = tracking_code ? sanitizeString(tracking_code) : null;
    const sanitizedStatus = sanitizeString(status);

    const t = await db.sequelize.transaction();

    try {
        const order = await Order.findByPk(orderId, { transaction: t });
        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found.' });
        }

        order.status = sanitizedStatus;
        await order.save({ transaction: t });

        const [shipment, created] = await ShipmentTracking.findOrCreate({
            where: { order_id: orderId },
            defaults: {
                provider_name: sanitizedProviderName,
                tracking_code: sanitizedTrackingCode,
                status: sanitizedStatus,
                estimated_delivery_date: estimated_delivery_date ? new Date(estimated_delivery_date) : null,
                last_update_date: new Date()
            },
            transaction: t
        });

        if (!created) {
            shipment.provider_name = sanitizedProviderName;
            shipment.tracking_code = sanitizedTrackingCode;
            shipment.status = sanitizedStatus;
            shipment.estimated_delivery_date = estimated_delivery_date ? new Date(estimated_delivery_date) : shipment.estimated_delivery_date;
            shipment.last_update_date = new Date();
            await shipment.save({ transaction: t });
        }

        await db.OrderHistory.create({
            order_id: order.id,
            status: sanitizedStatus,
            changed_at: new Date(),
            changed_by: req.user.id,
            description: `Shipping status updated to '${sanitizedStatus}' by admin.`
        }, { transaction: t });

        await t.commit();
        logger.info(`Shipping status for Order ID: ${orderId} updated to ${sanitizedStatus}.`);
        res.status(200).json({
            message: 'Shipping status updated successfully!',
            orderId: order.id,
            shipmentTracking: shipment
        });

    } catch (error) {
        await t.rollback();
        logger.error(`Error updating shipping status for order ${orderId}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error updating shipping status', error: error.message });
    }
};

// 👈 تابع برای دریافت اطلاعات ردیابی یک سفارش (همانند قبل)
exports.getShippingStatus = async (req, res) => {
    // ... (کدهای موجود)
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = await db.Role.findByPk(req.user.role_id);

    try {
        const order = await db.Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        if (order.user_id !== userId && userRole.name !== 'admin') {
            return res.status(403).json({ message: 'Access Denied: You are not authorized to view this shipment.' });
        }

        const shipment = await ShipmentTracking.findOne({ where: { order_id: orderId } });
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment tracking information not found for this order.' });
        }

        res.status(200).json({ shipment: shipment });
    } catch (error) {
        logger.error(`Error fetching shipping status for order ${orderId}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error fetching shipping status', error: error.message });
    }
};