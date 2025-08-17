// src/repositories/orderItemRepository.js

const { OrderItem } = require('../../models');

class OrderItemRepository {
    async bulkCreate(items, options = {}) {
        return await OrderItem.bulkCreate(items, options);
    }
}

module.exports = new OrderItemRepository();