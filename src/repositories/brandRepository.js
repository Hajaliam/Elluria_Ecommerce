// src/repositories/brandRepository.js

const { Brand } = require('../../models');

class BrandRepository {
    /**
     * @description Create a new brand
     * @param {object} data - Brand data (e.g., { name })
     * @returns {Promise<Brand>}
     */
    async create(data) {
        return await Brand.create(data);
    }

    /**
     * @description Find all brands
     * @returns {Promise<Brand[]>}
     */
    async findAll() {
        return await Brand.findAll();
    }

    /**
     * @description Find a brand by its ID
     * @param {number} id
     * @returns {Promise<Brand|null>}
     */
    async findById(id) {
        return await Brand.findByPk(id);
    }

    /**
     * @description Find a brand by its name
     * @param {string} name
     * @returns {Promise<Brand|null>}
     */
    async findByName(name) {
        return await Brand.findOne({ where: { name } });
    }

    /**
     * @description Update a brand
     * @param {number} id
     * @param {object} data
     * @returns {Promise<[number, Brand[]]>}
     */
    async update(id, data) {
        return await Brand.update(data, { where: { id }, returning: true });
    }

    /**
     * @description Delete a brand by its ID
     * @param {number} id
     * @returns {Promise<number>}
     */
    async delete(id) {
        return await Brand.destroy({ where: { id } });
    }
}

module.exports = new BrandRepository();