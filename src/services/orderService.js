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

function decimalToScaledInteger(value, scale, label) {
    if (value === null || value === undefined) {
        throw new Error(`${label} is missing.`);
    }

    const normalized = String(value).trim();
    const match = /^(\d+)(?:\.(\d+))?$/.exec(normalized);
    if (!match || (match[2] && match[2].length > scale)) {
        throw new Error(`${label} is invalid.`);
    }

    const fraction = (match[2] || '').padEnd(scale, '0');
    return BigInt(match[1]) * (10n ** BigInt(scale)) + BigInt(fraction || '0');
}

function moneyToCents(value, label) {
    return decimalToScaledInteger(value, 2, label);
}

function centsToMoney(value) {
    const absolute = value < 0n ? -value : value;
    const sign = value < 0n ? '-' : '';
    return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
}

function divideAndRound(numerator, denominator) {
    return (numerator + (denominator / 2n)) / denominator;
}

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
            const cartSnapshot = await this.cartService.getCartForOrderFinalization(
                userId,
                null,
                { transaction: t }
            );
            if (!cartSnapshot || cartSnapshot.items.length === 0) {
                const error = new Error('Cart is empty.');
                error.statusCode = 400;
                throw error;
            }

            const quantitiesByVariant = new Map();
            for (const item of cartSnapshot.items) {
                if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
                    const error = new Error(`Invalid cart quantity for variant: ${item.variant_id}`);
                    error.statusCode = 400;
                    throw error;
                }
                quantitiesByVariant.set(
                    item.variant_id,
                    (quantitiesByVariant.get(item.variant_id) || 0) + item.quantity
                );
            }

            const variantIDs = [...quantitiesByVariant.keys()].sort((a, b) => a - b);
            const variants = await this.productVariantRepository.findAllByIdsForUpdate(
                variantIDs,
                { transaction: t }
            );
            if (variants.length !== variantIDs.length) {
                const error = new Error('One or more product variants no longer exist.');
                error.statusCode = 400;
                throw error;
            }

            const orderLines = [];
            let subtotalCents = 0n;
            for (const variant of variants) {
                const quantity = quantitiesByVariant.get(variant.id);
                if (!Number.isSafeInteger(variant.stock_quantity) || variant.stock_quantity < quantity) {
                    const error = new Error(`Insufficient stock for variant: ${variant.id}`);
                    error.statusCode = 400;
                    throw error;
                }

                const effectivePrice = variant.price ?? variant.product?.price;
                let unitPriceCents;
                try {
                    unitPriceCents = moneyToCents(effectivePrice, `Price for variant ${variant.id}`);
                } catch (error) {
                    error.statusCode = 400;
                    throw error;
                }

                subtotalCents += unitPriceCents * BigInt(quantity);
                orderLines.push({
                    variant,
                    quantity,
                    unitPrice: centsToMoney(unitPriceCents)
                });
            }

            let discountCents = 0n;
            let shippingCents = 500n; // هزینه ارسال پیش‌فرض
            let couponId = null;

            if (couponCode) {
                const coupon = await couponValidator.validateCoupon(
                    couponCode,
                    userId,
                    variantIDs,
                    centsToMoney(subtotalCents),
                    { transaction: t }
                );


                // محاسبه تخفیف
                if (coupon.discount_type === 'percentage') {
                    const percentageHundredths = decimalToScaledInteger(
                        coupon.discount_value,
                        2,
                        'Coupon percentage'
                    );
                    discountCents = divideAndRound(subtotalCents * percentageHundredths, 10000n);
                    if (coupon.max_discount_amount !== null && coupon.max_discount_amount !== undefined) {
                        const maxDiscountCents = moneyToCents(
                            coupon.max_discount_amount,
                            'Maximum coupon discount'
                        );
                        if (discountCents > maxDiscountCents) discountCents = maxDiscountCents;
                    }
                } else if (coupon.discount_type === 'fixed_amount') {
                    discountCents = moneyToCents(coupon.discount_value, 'Coupon discount');
                } else if (coupon.discount_type === 'free_shipping') {
                    shippingCents = 0n;
                }
                couponId = coupon.id;
            }

            const finalAmountCents = subtotalCents - discountCents + shippingCents;
            if (finalAmountCents < 0n) {
                const error = new Error('Order total cannot be negative.');
                error.statusCode = 400;
                throw error;
            }

            const newOrder = await this.orderRepository.create({
                user_id: userId,
                total_amount: centsToMoney(finalAmountCents),
                status: 'pending',
                shipping_address_id: shippingAddressId,
                payment_status: 'unpaid',
                coupon_id: couponId
            }, { transaction: t });

            const orderItems = orderLines.map(({ variant, quantity, unitPrice }) => ({
                order_id: newOrder.id,
                variant_id: variant.id,
                quantity,
                price_at_purchase: unitPrice
            }));

            await this.orderItemRepository.bulkCreate(orderItems, { transaction: t });

            // کسر از انبار و ثبت لاگ
            for (const { variant, quantity } of orderLines) {
                const oldStock = variant.stock_quantity;
                variant.stock_quantity -= quantity;
                await this.productVariantRepository.save(variant, { transaction: t });

                await this.inventoryLogRepository.create({
                    product_id: variant.product_id,
                    variant_id: variant.id,
                    order_id: newOrder.id,
                    change_type: 'reserve',
                    quantity_change: -quantity,
                    old_stock_quantity: oldStock,
                    new_stock_quantity: variant.stock_quantity,
                    changed_by_user_id: userId,
                    description: `Stock reserved for new order #${newOrder.id}`
                }, { transaction: t });
            }

            // پاک کردن سبد خرید کاربر
            await this.cartService.clearCart(userId, null, { transaction: t });

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
