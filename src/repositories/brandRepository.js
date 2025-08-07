// src/repositories/brandRepository.js

const { Brand } = require('../../models');

class BrandRepository {
    async create(data, options = {}) {
        return await Brand.create(data, options);
    }


    async findAll(options = {}) {
        return await Brand.findAll(options);
    }

    async findById(id, options = {}) {
        return await Brand.findByPk(id, options);
    }

    async findByName(name, options = {}) {
        return await Brand.findOne({ where: { name }, ...options });
    }

    async save(instance, options = {}) {
        return await instance.save(options);
    }

    async delete(id, options = {}) {
        return await Brand.destroy({ where: { id }, ...options });
    }
}

module.exports = new BrandRepository();