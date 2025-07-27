// src/controllers/brandController.js

const db = require('../../models');
const Brand = db.Brand;
const Product = db.Product; // برای بررسی محصولات مرتبط هنگام حذف
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer');
const CategoryTreeBuilder = require('../utils/categoryTreeBuilder');

// تابع برای ایجاد برند جدید
exports.createBrand = async (req, res) => {
    let { name } = req.body;
    name = sanitizeString(name);

    try {
        const existingBrand = await Brand.findOne({ where: { name: name } });
        if (existingBrand) {
            return res.status(409).json({ message: 'Brand with this name already exists.' });
        }
        const newBrand = await Brand.create({ name });
        res.status(201).json({ message: 'Brand created successfully!', brand: newBrand });
    } catch (error) {
        logger.error(`Error creating brand: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error creating brand', error: error.message });
    }
};

// تابع برای دریافت همه برندها
exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.findAll();
        res.status(200).json({ brands: brands });
    } catch (error) {
        logger.error(`Error fetching all brands: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error fetching brands', error: error.message });
    }
};

// تابع برای دریافت یک برند بر اساس ID
// تابع برای دریافت یک برند بر اساس ID + دسته‌بندی‌ها و محصولاتش به‌صورت درختی
//OOP
exports.getBrandById = async (req, res) => {
    const { id } = req.params;
    try {
        const brand = await Brand.findByPk(id);
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found.' });
        }

        const products = await Product.findAll({
            where: { brand_id: id },
            include: {
                model: db.Category,
                as: 'category',
                attributes: ['id', 'name', 'parent_id']
            },
            attributes: ['id', 'name', 'price', 'category_id']
        });

        const treeBuilder = new CategoryTreeBuilder(products);
        const categoryTree = treeBuilder.generate();

        return res.status(200).json({
            brand: {
                id: brand.id,
                name: brand.name
            },
            categories: categoryTree
        });

    } catch (error) {
        logger.error(`Error fetching brand ${id}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error fetching brand', error: error.message });
    }
};
// تابع برای به‌روزرسانی یک برند
exports.updateBrand = async (req, res) => {
    const { id } = req.params;
    let { name } = req.body;
    name = sanitizeString(name);

    try {
        const brand = await Brand.findByPk(id);
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found.' });
        }
        if (name && name !== brand.name) {
            const existingBrand = await Brand.findOne({ where: { name: name, id: { [Sequelize.Op.ne]: id } } });
            if (existingBrand) {
                return res.status(409).json({ message: 'Brand with this name already exists.' });
            }
        }
        brand.name = name || brand.name;
        await brand.save();
        res.status(200).json({ message: 'Brand updated successfully!', brand: brand });
    } catch (error) {
        logger.error(`Error updating brand ${id}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error updating brand', error: error.message });
    }
};

// تابع برای حذف یک برند
exports.deleteBrand = async (req, res) => {
    const { id } = req.params;
    try {
        const brand = await Brand.findByPk(id);
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found.' });
        }
        // اگر Productی به این برند ارجاع می‌دهد، حذف نمی‌شود (onDelete: SET NULL در Migration)
        // می‌توانیم قبل از حذف، محصولات وابسته را پیدا کنیم:
        const associatedProductsCount = await Product.count({ where: { brand_id: id } });
        if (associatedProductsCount > 0) {
            // اگر onDelete: SET NULL بود، حذف می‌شود. این پیام فقط برای اطلاع‌رسانی است.
            logger.warn(`Brand ${id} has ${associatedProductsCount} associated products. Their brand_id will be set to NULL.`);
        }
        await brand.destroy();
        res.status(200).json({ message: 'Brand deleted successfully!' });
    } catch (error) {
        logger.error(`Error deleting brand ${id}: ${error.message}`, { stack: error.stack });
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'Cannot delete brand: Associated products exist (foreign key constraint).' });
        }
        res.status(500).json({ message: 'Server error deleting brand', error: error.message });
    }
};
