// src/repositories/orderRepository.js

const { Order, OrderItem, ProductVariant, Product, Address, Coupon } = require('../../models');

class OrderRepository {
    async create(data, options = {}) {
        return await Order.create(data, options);
    }

    async findByIdWithDetails(id, options = {}) {
        return await Order.findByPk(id, {
            ...options,
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [{
                        model: ProductVariant,
                        as: 'variant',
                        include: [{ model: Product, as: 'product' }]
                    }]
                },
                { model: Address, as: 'shippingAddress' },
                { model: Coupon, as: 'coupon' }
            ]
        });
    }

    async findAll(options = {}) {
        return await Order.findAll({
            ...options,
            include: ['user', 'orderItems'], // Include basic details for list view
            order: [['createdAt', 'DESC']]
        });
    }

    async save(instance, options = {}) {
        return await instance.save(options);
    }
}

module.exports = new OrderRepository();