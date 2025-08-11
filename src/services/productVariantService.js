// src/services/productVariantService.js

const db = require('../../models');
const productRepository = require('../repositories/productRepository');
const productVariantRepository = require('../repositories/productVariantRepository');
const attributeValueRepository = require('../repositories/attributeValueRepository');
const { logger } = require('../config/logger');

class ProductVariantService {
    constructor() {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.attributeValueRepository = attributeValueRepository;
    }

    async getVariantsForProduct(productId) {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            const error = new Error('Parent product not found.');
            error.statusCode = 404;
            throw error;
        }
        return await this.productVariantRepository.findAllByProductId(productId);
    }

    async createVariantForProduct(productId, variantData) {
        const t = await db.sequelize.transaction();
        try {
            const { price, stock_quantity, sku, image_url, values: attributeValueIds } = variantData;

            const product = await this.productRepository.findById(productId, { transaction: t });
            if (!product) {
                const error = new Error('Parent product not found.');
                error.statusCode = 404;
                throw error;
            }

            if (!attributeValueIds || attributeValueIds.length === 0) {
                const error = new Error('At least one attribute value is required to create a variant.');
                error.statusCode = 400;
                throw error;
            }

            // اعتبارسنجی وجود مقادیر ویژگی‌ها
            const valueInstances = await this.attributeValueRepository.findAllByIds(attributeValueIds);
            if (valueInstances.length !== attributeValueIds.length) {
                const error = new Error('One or more attribute values are invalid.');
                error.statusCode = 400;
                throw error;
            }

            // جلوگیری از ایجاد متغیر تکراری با همین مقادیر
            const existingVariants = await this.productVariantRepository.findAllByProductId(productId, { transaction: t });

            for (const variant of existingVariants) {
                // گرفتن attribute values هر وریانت
                const variantValues = await variant.getValues({ transaction: t });
                const variantValueIds = variantValues.map(v => v.id).sort();
                const newValueIdsSorted = [...attributeValueIds].sort();

                // مقایسه آرایه‌ها
                if (variantValueIds.length === newValueIdsSorted.length &&
                    variantValueIds.every((val, index) => val === newValueIdsSorted[index])) {
                    const error = new Error('A variant with the same attribute values already exists.');
                    error.statusCode = 409; // conflict
                    throw error;
                }
            }

            const newVariant = await this.productVariantRepository.create({
                product_id: productId,
                price,
                stock_quantity,
                sku,
                image_url
            }, { transaction: t });

            // اتصال مقادیر ویژگی‌ها به متغیر جدید
            await newVariant.setValues(valueInstances, { transaction: t });

            await t.commit();
            return await this.productVariantRepository.findById(newVariant.id);
        } catch (error) {
            await t.rollback();
            if (!error.statusCode) logger.error(`CreateVariant Error: ${error.message}`);
            throw error;
        }
    }

    async updateVariant(variantId, updateData) {
        const t = await db.sequelize.transaction();
        try {
            const { price, stock_quantity, sku, image_url, values: attributeValueIds } = updateData;

            // پیدا کردن وریانت
            const variant = await this.productVariantRepository.findById(variantId, { transaction: t });
            if (!variant) {
                const error = new Error('Variant not found.');
                error.statusCode = 404;
                throw error;
            }

            // اگر کاربر لیست attributeValueIds فرستاد، باید اعتبارسنجی کنیم
            let valueInstances = [];
            if (attributeValueIds && attributeValueIds.length > 0) {
                valueInstances = await this.attributeValueRepository.findAllByIds(attributeValueIds);
                if (valueInstances.length !== attributeValueIds.length) {
                    const error = new Error('One or more attribute values are invalid.');
                    error.statusCode = 400;
                    throw error;
                }
            }

            // آپدیت فیلدهای اصلی وریانت
            if (price !== undefined) variant.price = price;
            if (stock_quantity !== undefined) variant.stock_quantity = stock_quantity;
            if (sku !== undefined) variant.sku = sku;
            if (image_url !== undefined) variant.image_url = image_url;

            await this.productVariantRepository.save(variant, { transaction: t });

            // اگر attributeValueIds داده شده بود، ابتدا پاک و سپس ثبت مجدد کنیم
            if (attributeValueIds && attributeValueIds.length > 0) {
                await require('../repositories/variantValueRepository')
                    .deleteAllByVariantId(variantId, { transaction: t });
                await variant.setValues(valueInstances, { transaction: t });
            }

            await t.commit();
            return await this.productVariantRepository.findById(variantId);
        } catch (error) {
            await t.rollback();
            if (!error.statusCode) logger.error(`UpdateVariant Error: ${error.message}`);
            throw error;
        }
    }
    async deleteVariant(variantId) {
        const t = await db.sequelize.transaction();
        try {
            // پیدا کردن وریانت
            const variant = await this.productVariantRepository.findById(variantId, { transaction: t });
            if (!variant) {
                const error = new Error('Variant not found.');
                error.statusCode = 404;
                throw error;
            }

            // حذف لینک‌های attribute values
            await require('../repositories/variantValueRepository')
                .deleteAllByVariantId(variantId, { transaction: t });

            // حذف خود وریانت
            await this.productVariantRepository.delete(variantId, { transaction: t });

            await t.commit();
            return { message: 'Variant deleted successfully.' };
        } catch (error) {
            await t.rollback();
            if (!error.statusCode) logger.error(`DeleteVariant Error: ${error.message}`);
            throw error;
        }
    }

}

module.exports = new ProductVariantService();
