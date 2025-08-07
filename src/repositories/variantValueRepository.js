// src/repositories/variantValueRepository.js

const { VariantValue } = require('../../models');

class VariantValueRepository {
    /**
     * @description Creates a link between a variant and an attribute value.
     * @param {object} data - { variant_id, attribute_value_id }
     * @param {object} options - Sequelize options, e.g., { transaction: t }
     * @returns {Promise<VariantValue>}
     */
    async create(data, options = {}) {
        return await VariantValue.create(data, options);
    }

    /**
     * @description Deletes all links for a given variant ID. Useful when updating a variant's values.
     * @param {number} variantId
     * @param {object} options - Sequelize options, e.g., { transaction: t }
     * @returns {Promise<number>}
     */
    async deleteAllByVariantId(variantId, options = {}) {
        return await VariantValue.destroy({ where: { variant_id: variantId }, ...options });
    }
}

module.exports = new VariantValueRepository();