// src/services/brandService.js

const brandRepository = require('../repositories/brandRepository');
const productRepository = require('../repositories/productRepository'); // ما به این ریپازیتوری برای گرفتن محصولات یک برند نیاز خواهیم داشت
const CategoryTreeBuilder = require('../utils/categoryTreeBuilder');
const { sanitizeString } = require('../utils/sanitizer');

class BrandService {
    constructor(brandRepo, productRepo) {
        this.brandRepository = brandRepo;
        this.productRepository = productRepo;
    }

    async createBrand(brandData) {
        const { name } = brandData;
        const sanitizedName = sanitizeString(name);

        const existingBrand = await this.brandRepository.findByName(sanitizedName);
        if (existingBrand) {
            const error = new Error('Brand with this name already exists.');
            error.statusCode = 409; // Conflict
            throw error;
        }

        return await this.brandRepository.create({ name: sanitizedName });
    }

    async getAllBrands() {
        return await this.brandRepository.findAll();
    }

    async getBrandById(id) {
        const brand = await this.brandRepository.findById(id);
        if (!brand) {
            const error = new Error('Brand not found.');
            error.statusCode = 404;
            throw error;
        }

        // همان منطق پیچیده قبلی برای ساختن درخت دسته‌بندی محصولات
        const products = await this.productRepository.findByBrandId(id);
        const treeBuilder = new CategoryTreeBuilder(products);
        const categoryTree = treeBuilder.generate();

        // خروجی را دقیقاً مطابق با ساختار قبلی کنترلر برمی‌گردانیم
        return {
            brand: {
                id: brand.id,
                name: brand.name
            },
            categories: categoryTree
        };
    }

    async updateBrand(id, updateData) {
        const { name } = updateData;
        const brandToUpdate = await this.brandRepository.findById(id);
        if (!brandToUpdate) {
            const error = new Error('Brand not found.');
            error.statusCode = 404;
            throw error;
        }

        if (name) {
            const sanitizedName = sanitizeString(name);
            if (sanitizedName !== brandToUpdate.name) {
                const existingBrand = await this.brandRepository.findByName(sanitizedName);
                if (existingBrand && existingBrand.id !== parseInt(id)) {
                    const error = new Error('Brand with this name already exists.');
                    error.statusCode = 409;
                    throw error;
                }
            }
            brandToUpdate.name = sanitizedName;
        }

        await brandToUpdate.save();
        return brandToUpdate;
    }

    async deleteBrand(id) {
        const brand = await this.brandRepository.findById(id);
        if (!brand) {
            const error = new Error('Brand not found.');
            error.statusCode = 404;
            throw error;
        }

        const associatedProductsCount = await this.productRepository.countByBrandId(id);
        if (associatedProductsCount > 0) {
            // نکته: با توجه به onDelete: SET NULL، حذف انجام می‌شود.
            // این بخش می‌تواند برای لاگ‌گیری یا منطق‌های دیگر استفاده شود.
            console.warn(`Brand ${id} has ${associatedProductsCount} associated products. Their brand_id will be set to NULL.`);
        }

        await this.brandRepository.delete(id);
        return true; // Indicates success
    }
}

// فرض می‌کنیم شما یک productRepository هم مشابه brandRepository خواهید ساخت.
// برای ادامه کار، فعلاً یک فایل موقت برای آن می‌سازیم.
module.exports = new BrandService(brandRepository, productRepository);