// src/controllers/searchController.js

const db = require('../../models');
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer');
const logger = require('../config/logger');

// تابع برای جستجوی عمومی
exports.globalSearch = async (req, res) => {
    const { query, minPrice, maxPrice, inStock, minRating, maxRating, brandId, brandName, limit, offset, sortBy, sortOrder } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    const sanitizedQuery = sanitizeString(query);

    try {
        const productWhereClause = {
            [Sequelize.Op.or]: [
                { name: { [Sequelize.Op.iLike]: `%${sanitizedQuery}%` } },
                { description: { [Sequelize.Op.iLike]: `%${sanitizedQuery}%` } }
            ]
        };

        const categoryWhereClause = {
            name: { [Sequelize.Op.iLike]: `%${sanitizedQuery}%` }
        };

        // 👈 فیلتر قیمت
        if (minPrice && maxPrice) {
            productWhereClause.price = { [Sequelize.Op.between]: [minPrice, maxPrice] };
        } else if (minPrice) {
            productWhereClause.price = { [Sequelize.Op.gte]: minPrice };
        } else if (maxPrice) {
            productWhereClause.price = { [Sequelize.Op.lte]: maxPrice };
        }

        // 👈 فیلتر موجودی
        if (inStock && inStock.toLowerCase() === 'true') {
            productWhereClause.stock_quantity = { [Sequelize.Op.gt]: 0 };
        }

        // 👈 فیلتر برند
        if (brandId) {
            productWhereClause.brand_id = brandId;
        } else if (brandName) {
            const brand = await db.Brand.findOne({ where: { name: brandName } });
            if (brand) {
                productWhereClause.brand_id = brand.id;
            } else {
                return res.status(200).json({ products: [], categories: [] }); // اگر برند نبود، چیزی نشون نده
            }
        }

        // 👈 فیلتر رتبه‌بندی (rating)
        if (minRating || maxRating) {
            const havingConditions = [];
            if (minRating) {
                havingConditions.push(`AVG("rating") >= ${parseFloat(minRating)}`);
            }
            if (maxRating) {
                havingConditions.push(`AVG("rating") >= ${parseFloat(maxRating)}`);
            }

            if (havingConditions.length > 0) {
                const productIdsWithRating = await db.Review.findAll({
                    attributes: ['product_id'],
                    group: ['product_id'],
                    having: Sequelize.literal(havingConditions.join(' AND '))
                }).then(result => result.map(item => item.get('product_id')));

                productWhereClause.id = { [Sequelize.Op.in]: productIdsWithRating };
            }
        }

        let orderClause = [];
        if (sortBy) {
            const order = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            switch (sortBy) {
                case 'price':
                    orderClause.push(['price', order]);
                    break;
                case 'most_popular':
                    orderClause.push(['views_count', order]);
                    break;
                case 'best_selling':
                    orderClause.push(['sold_count', order]);
                    break;
                case 'newest':
                case 'oldest':
                    orderClause.push(['createdAt', order]);
                    break;
                default:
                    orderClause.push(['createdAt', 'DESC']);
            }
        } else {
            orderClause.push(['createdAt', 'DESC']);
        }

        const products = await db.Product.findAll({
            where: productWhereClause,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : 0,
            include: [
                { model: db.Category, as: 'category' },
                { model: db.Brand, as: 'brand' }
            ],
            order: orderClause
        });

        const categories = await db.Category.findAll({
            where: categoryWhereClause,
            limit: 5,
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            products,
            categories
        });

    } catch (error) {
        logger.error(`Error during global search: ${error.message}`, { stack: error.stack });
        console.error(error); // برای لاگ در توسعه
        res.status(500).json({ message: 'Server error during search', error: error.message });
    }
};
