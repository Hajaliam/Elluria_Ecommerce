// src/repositories/orderHistoryRepository.js
const { OrderHistory } = require('../../models');

class OrderHistoryRepository {
    async create(data, options = {}) {
        return await OrderHistory.create(data, options);
    }
}

module.exports = new OrderHistoryRepository();