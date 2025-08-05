// src/repositories/productRepository.js

const { Product, Category, CampaignProduct, Campaign, Sequelize } = require('../../models');

class ProductRepository {
    async create(data, options = {}) {
        return await Product.create(data, options);
    }

    async save(productInstance, options = {}) {
        return await productInstance.save(options);
    }

    async findById(id, options = {}) {
        return await Product.findByPk(id, {
            ...options,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name'],
                },
                {
                    model: CampaignProduct,
                    as: 'campaignProduct',
                    required: false,
                    include: [
                        {
                            model: Campaign,
                            as: 'campaign',
                            where: {
                                is_active: true,
                                start_date: { [Sequelize.Op.lte]: new Date() },
                                end_date: { [Sequelize.Op.gte]: new Date() },
                            },
                            required: true,
                            attributes: ['id', 'title'],
                        },
                    ],
                    attributes: ['campaign_price'],
                },
            ],
        });
    }

    async findByNameOrSlug(name, slug, excludeId = null, transaction = null) {
        const whereClause = {
            [Sequelize.Op.or]: [{ name }, { slug }],
        };

        if (excludeId) {
            whereClause.id = { [Sequelize.Op.ne]: excludeId };
        }

        return await Product.findOne({ where: whereClause, transaction });
    }

    async findAndCountAllWithFilters(filters = {}, pagination = {}, sorting = {}) {
        const { categoryId, brand_id, search, minPrice, maxPrice } = filters;
        const { limit, offset } = pagination;
        const { sortBy = 'createdAt', sortOrder = 'DESC' } = sorting;

        const whereClause = {};
        const orderClause = [[sortBy, sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];

        if (categoryId) whereClause.category_id = categoryId;
        if (brand_id) whereClause.brand_id = brand_id;
        if (search) {
            whereClause.name = { [Sequelize.Op.iLike]: `%${search}%` };
        }
        if (minPrice && maxPrice) {
            whereClause.price = { [Sequelize.Op.between]: [minPrice, maxPrice] };
        } else if (minPrice) {
            whereClause.price = { [Sequelize.Op.gte]: minPrice };
        } else if (maxPrice) {
            whereClause.price = { [Sequelize.Op.lte]: maxPrice };
        }

        return await Product.findAndCountAll({
            where: whereClause,
            order: orderClause,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name'],
                },
                {
                    model: CampaignProduct,
                    as: 'campaignProduct',
                    required: false,
                    include: [
                        {
                            model: Campaign,
                            as: 'campaign',
                            where: {
                                is_active: true,
                                start_date: { [Sequelize.Op.lte]: new Date() },
                                end_date: { [Sequelize.Op.gte]: new Date() },
                            },
                            required: true,
                            attributes: ['id', 'title', 'start_date', 'end_date'],
                        },
                    ],
                    attributes: ['campaign_price', 'original_price'],
                },
            ],
        });
    }

    async update(productInstance, updatedFields, options = {}) {
        Object.assign(productInstance, updatedFields);
        return await productInstance.save(options);
    }

    async delete(productInstance) {
        return await productInstance.destroy();
    }

    async countByBrandId(brandId) {
        return await Product.count({ where: { brand_id: brandId } });
    }

    async findByBrandId(brandId) {
        return await Product.findAll({
            where: { brand_id: brandId },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name'],
                },
            ],
        });
    }
}

module.exports = new ProductRepository();
