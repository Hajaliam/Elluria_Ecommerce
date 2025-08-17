// src/services/orderService.js

const db = require('../../models');
const orderRepository = require('../repositories/orderRepository');
const orderItemRepository = require('../repositories/orderItemRepository');
const cartService = require('./cartService'); // برای گرفتن سبد خرید
const productVariantRepository = require('../repositories/productVariantRepository');
const couponRepository = require('../repositories/couponRepository'); // برای اعتبارسنجی کوپن
const inventoryLogRepository = require('../repositories/inventoryLogRepository');
const couponValidator = require('../services/couponValidationService');
const { logger } = require('../config/logger');
const { Op } = require('sequelize');

class OrderService {
    constructor() {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartService = cartService;
        this.productVariantRepository = productVariantRepository;
        this.couponRepository = couponRepository;
        this.inventoryLogRepository = inventoryLogRepository;
    }

    async placeOrder(userId, data) {
        const { shippingAddressId, couponCode } = data;
        const t = await db.sequelize.transaction();

        try {
            const cart = await this.cartService.getCart(userId, null);
            if (!cart || cart.items.length === 0) {
                const error = new Error('Cart is empty.');
                error.statusCode = 400;
                throw error;
            }
            const variantIDs = [];
            // اعتبارسنجی موجودی تمام آیتم‌ها
            for (const item of cart.items) {
                const variant = await this.productVariantRepository.findById(item.variantId, { transaction: t });
                if (variant.stock_quantity < item.quantity) {
                    const error = new Error(`Insufficient stock for product: ${item.name}`);
                    error.statusCode = 400;
                    throw error;
                }
                variantIDs.push(variant.id);
            }

            let totalAmount = parseFloat(cart.totalAmount);
            let discountAmount = 0;
            let shippingCost = 5.00; // هزینه ارسال پیش‌فرض
            let couponId = null;

            if (couponCode) {
                const coupon = await couponValidator.validateCoupon(couponCode, userId, variantIDs,totalAmount , {transaction: t });


                // محاسبه تخفیف
                if (coupon.discount_type === 'percentage') {
                    discountAmount = (totalAmount * parseFloat(coupon.discount_value)) / 100;
                    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
                        discountAmount = parseFloat(coupon.max_discount_amount);
                    }
                } else if (coupon.discount_type === 'fixed_amount') {
                    discountAmount = parseFloat(coupon.discount_value);
                } else if (coupon.discount_type === 'free_shipping') {
                    shippingCost = 0;
                }
                couponId = coupon.id;
            }

            const finalAmount = totalAmount - discountAmount + shippingCost;

            const newOrder = await this.orderRepository.create({
                user_id: userId,
                total_amount: finalAmount,
                status: 'pending',
                shipping_address_id: shippingAddressId,
                payment_status: 'unpaid',
                coupon_id: couponId
            }, { transaction: t });

            const orderItems = cart.items.map(item => ({
                order_id: newOrder.id,
                variant_id: item.variantId,
                quantity: item.quantity,
                price_at_purchase: item.price
            }));

            await this.orderItemRepository.bulkCreate(orderItems, { transaction: t });

            // کسر از انبار و ثبت لاگ
            for (const item of cart.items) {
                const variant = await this.productVariantRepository.findById(item.variantId, { transaction: t, lock: t.LOCK.UPDATE });
                const oldStock = variant.stock_quantity;
                variant.stock_quantity -= item.quantity;
                await this.productVariantRepository.save(variant, { transaction: t });

                await this.inventoryLogRepository.create({
                    product_id: item.productId,
                    variant_id: item.variantId, // ستون variant_id باید به InventoryLog اضافه شود
                    change_type: 'reserve',
                    quantity_change: -item.quantity,
                    old_stock_quantity: oldStock,
                    new_stock_quantity: variant.stock_quantity,
                    changed_by_user_id: userId,
                    description: `Stock reserved for new order #${newOrder.id}`
                }, { transaction: t });
            }

            // پاک کردن سبد خرید کاربر
            await this.cartService.clearCart(userId, null);

            await t.commit();
            return newOrder;
        } catch (error) {
            await t.rollback();
            logger.error(`PlaceOrder Error: ${error.message}`);
            throw error;
        }
    }

    async getOrderById(orderId, user) {
        const order = await this.orderRepository.findByIdWithDetails(orderId);
        if (!order) {
            const error = new Error('Order not found.');
            error.statusCode = 404;
            throw error;
        }
        // Authorization check
        if (user.role_id !== 2 && order.user_id !== user.id) { // فرض بر اینکه role_id ادمین 2 است
            const error = new Error('Access Denied.');
            error.statusCode = 403;
            throw error;
        }
        return order;
    }

    async getAllOrders(filters, user) {
        const whereClause = {};

        // اگر کاربر ادمین نباشد، فقط سفارشات خودش را ببیند
        if (user.role.name !== 'admin') {
            whereClause.user_id = user.id;
        } else {
            // اعمال فیلترهای ادمین
            if (filters.user_id) whereClause.user_id = filters.user_id;
            if (filters.status) whereClause.status = filters.status;
            if (filters.payment_status) whereClause.payment_status = filters.payment_status;
        }

        return await this.orderRepository.findAll({ where: whereClause });
    }

    async updateOrderStatus(orderId, newStatus, adminUserId) {
        const t = await db.sequelize.transaction();
        try {
            const order = await this.orderRepository.findById(orderId, { transaction: t });
            if (!order) {
                const error = new Error('Order not found.');
                error.statusCode = 404;
                throw error;
            }

            order.status = newStatus;
            await this.orderRepository.save(order, { transaction: t });

            await require('../repositories/orderHistoryRepository').create({
                order_id: order.id,
                status: newStatus,
                changed_by: adminUserId
            }, { transaction: t });

            await t.commit();
            return order;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async cancelOrder(orderId, user) {
        const t = await db.sequelize.transaction();
        try {
            const order = await this.orderRepository.findByIdWithDetails(orderId, { transaction: t });
            if (!order) {
                const error = new Error('Order not found.');
                error.statusCode = 404;
                throw error;
            }

            // Authorization
            if (user.role.name !== 'admin' && order.user_id !== user.id) {
                const error = new Error('Access Denied.');
                error.statusCode = 403;
                throw error;
            }

            if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
                const error = new Error(`Cannot cancel order in status: ${order.status}`);
                error.statusCode = 400;
                throw error;
            }

            // بازگرداندن موجودی انبار
            for (const item of order.orderItems) {
                await item.variant.increment('stock_quantity', { by: item.quantity, transaction: t });
                // ثبت لاگ بازگشت موجودی
            }

            // بازگرداندن استفاده از کوپن
            if (order.coupon_id) {
                await order.coupon.decrement('used_count', { by: 1, transaction: t });
                // منطق برای UserCouponUsage نیز باید اضافه شود
            }

            order.status = 'cancelled';
            await this.orderRepository.save(order, { transaction: t });
            await require('../repositories/orderHistoryRepository').create({
                order_id: order.id, status: 'cancelled', changed_by: user.id
            }, { transaction: t });

            await t.commit();
            return order;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

module.exports = new OrderService();