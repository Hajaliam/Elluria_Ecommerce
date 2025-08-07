// src/repositories/productVariantRepository.js

const { ProductVariant, AttributeValue, Attribute } = require('../../models');

class ProductVariantRepository {
    async create(data, options = {}) {
        return await ProductVariant.create(data, options);
    }

    async findById(id, options = {}) {
        return await ProductVariant.findByPk(id, {
            ...options,
            include: [
                {
                    model: AttributeValue,
                    as: 'values',
                    include: [{
                        model: Attribute,
                        as: 'attribute',
                        attributes: ['name']
                    }],
                    through: { attributes: [] } // جدول واسط را در خروجی نیاور
                }
            ]
        });
    }

    async findAllByProductId(productId, options = {}) {
        return await ProductVariant.findAll({
            where: { product_id: productId },
            ...options,
            include: [
                {
                    model: AttributeValue,
                    as: 'values',
                    attributes: ['value'],
                    include: [{
                        model: Attribute,
                        as: 'attribute',
                        attributes: ['name']
                    }],
                    through: { attributes: [] }
                }
            ]
        });
    }

    async save(instance, options = {}) {
        return await instance.save(options);
    }

    async delete(id, options = {}) {
        return await ProductVariant.destroy({ where: { id }, ...options });
    }
}

module.exports = new ProductVariantRepository();