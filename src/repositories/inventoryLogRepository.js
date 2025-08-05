// src/repositories/inventoryLogRepository.js
const { InventoryLog } = require('../../models');

class InventoryLogRepository {
    async create(data, options = {}) {
        return await InventoryLog.create(data, options);
    }
}

module.exports = new InventoryLogRepository();