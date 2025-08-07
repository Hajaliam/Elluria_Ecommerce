// src/services/categoryService.js

const categoryRepository = require('../repositories/categoryRepository');
//const productRepository = require('../repositories/productRepository'); // برای چک کردن محصولات وابسته هنگام حذف
const { sanitizeString } = require('../utils/sanitizer');

class CategoryService {
    constructor(categoryRepo) {
        this.categoryRepository = categoryRepo;
        //this.productRepository = productRepo;
    }

    async createCategory(data) {
        const { name, description, parent_id } = data;
        const sanitizedName = sanitizeString(name);

        const existing = await this.categoryRepository.findByName(sanitizedName);
        if (existing) {
            const error = new Error('Category with this name already exists.');
            error.statusCode = 409;
            throw error;
        }

        if (parent_id) {
            const parentExists = await this.categoryRepository.findById(parent_id);
            if (!parentExists) {
                const error = new Error('Parent category not found.');
                error.statusCode = 400;
                throw error;
            }
        }

        return await this.categoryRepository.create({
            name: sanitizedName,
            description: sanitizeString(description),
            parent_id: parent_id || null
        });
    }

    async getAllCategories() {
        const categories = await this.categoryRepository.findAll();

        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parent_id === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id),
                }));
        };

        return buildTree(categories);
    }

    async getCategoryById(id) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            const error = new Error('Category not found.');
            error.statusCode = 404;
            throw error;
        }
        // در اینجا می‌توانید منطق ساخت زیر-درخت را نیز اضافه کنید اگر نیاز باشد
        return category;
    }

    async getChildrensById(id) {
        const categories = await this.categoryRepository.findAll({
            attributes: ['id', 'name', 'parent_id', 'description'],
            raw: true,
        });

        // چک کن دسته اصلی وجود داره یا نه
        const rootCategory = categories.find(cat => cat.id === parseInt(id));
        if (!rootCategory) {
            const error = new Error('Category not found.');
            error.statusCode = 404;
            throw error;
        }

        // تابع بازگشتی برای ساخت subtree
        const buildTree = (parentId) => {
            return categories
                .filter(cat => cat.parent_id === parentId)
                .map(cat => ({
                    ...cat,
                    children: buildTree(cat.id),
                }));
        };

        // برگشت زیرشاخه‌ها
        const childrenTree = buildTree(parseInt(id));
        return childrenTree;
    }

    async updateCategory(id, data) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            const error = new Error('Category not found.');
            error.statusCode = 404;
            throw error;
        }

        if (data.name) {
            const sanitizedName = sanitizeString(data.name);
            if (sanitizedName !== category.name) {
                const existing = await this.categoryRepository.findByName(sanitizedName);
                if (existing && existing.id !== parseInt(id)) {
                    const error = new Error('Category with this name already exists.');
                    error.statusCode = 409;
                    throw error;
                }
                category.name = sanitizedName;
            }
        }

        if (data.description) {
            category.description = sanitizeString(data.description);
        }
        if ('parent_id' in data) {
            if (data.parent_id && parseInt(data.parent_id) === parseInt(id)) {
                const error = new Error('A category cannot be its own parent.');
                error.statusCode = 400;
                throw error;
            }
            category.parent_id = data.parent_id;
        }

        return await this.categoryRepository.save(category);
    }

    async deleteCategory(id) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            const error = new Error('Category not found.');
            error.statusCode = 404;
            throw error;
        }

        // نکته: منطق بررسی محصولات وابسته قبل از حذف، به دلیل وجود 'onDelete: RESTRICT'
        // در سطح دیتابیس مدیریت می‌شود و Sequelize خطای مناسب را پرتاب خواهد کرد.

        return await this.categoryRepository.delete(category);
    }
}

module.exports = new CategoryService(categoryRepository);