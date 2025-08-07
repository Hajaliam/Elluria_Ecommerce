// src/repositories/categoryRepository.js
const { Category } = require('../../models');

class CategoryRepository {
    async create(data, options = {}) {
        return await Category.create(data, options);
    }

    async findAll(options = {}) {
        return await Category.findAll({ ...options, raw: true });
    }

    async findAllSimple(options = {}) {
        return await Category.findAll({
            attributes: ['id', 'name', 'parent_id'],
            ...options
        });
    }

    async findById(id, options = {}) {
        return await Category.findByPk(id, options);
    }

    async findByName(name, options = {}) {
        return await Category.findOne({ where: { name }, ...options });
    }

    async save(instance, options = {}) {
        return await instance.save(options);
    }

    async delete(instance, options = {}) {
        return await instance.destroy(options);
    }
}

module.exports = new CategoryRepository();