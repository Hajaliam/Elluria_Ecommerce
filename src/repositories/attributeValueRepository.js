// src/repositories/attributeValueRepository.js

const { AttributeValue } = require('../../models');

class AttributeValueRepository {
    async create(data, options = {}) {
        return await AttributeValue.create(data, options);
    }

    async findAllByAttributeId(attributeId, options = {}) {
        return await AttributeValue.findAll({
            where: { attribute_id: attributeId },
            ...options
        });
    }

    async findById(id, options = {}) {
        return await AttributeValue.findByPk(id, options);
    }

    async findByValue(attributeId, value, options = {}) {
        return await AttributeValue.findOne({
            where: { attribute_id: attributeId, value },
            ...options
        });
    }

    async update(id, data, options = {}) {
        const [updatedRows, [updatedValue]] = await AttributeValue.update(data, {
            where: { id },
            returning: true,
            ...options
        });
        return updatedValue;
    }

    async delete(id, options = {}) {
        return await AttributeValue.destroy({ where: { id }, ...options });
    }
}

module.exports = new AttributeValueRepository();