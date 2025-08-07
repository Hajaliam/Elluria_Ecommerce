// src/repositories/attributeRepository.js

const { Attribute } = require('../../models');

class AttributeRepository {
    async create(data, options = {}) {
        return await Attribute.create(data, options);
    }

    async findAll(options = {}) {
        return await Attribute.findAll(options);
    }

    async findById(id, options = {}) {
        return await Attribute.findByPk(id, options);
    }

    async findByName(name, options = {}) {
        return await Attribute.findOne({ where: { name }, ...options });
    }

    async update(id, data, options = {}) {
        const [updatedRows, [updatedAttribute]] = await Attribute.update(data, {
            where: { id },
            returning: true,
            ...options
        });
        return updatedAttribute;
    }

    async save(instance, options = {}) {
        return await instance.save(options);
    }

    async delete(id, options = {}) {
        const instance = await this.findById(id, options);
        if (instance) {
            return await instance.destroy(options);
        }
        return 0; // Indicates no rows deleted
    }
}

module.exports = new AttributeRepository();
