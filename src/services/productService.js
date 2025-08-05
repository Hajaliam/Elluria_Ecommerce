// src/services/productService.js

const productRepository = require('../repositories/productRepository');
// ما به یک ریپازیتوری برای لاگ‌های انبار هم نیاز داریم تا وابستگی مستقیم به مدل نداشته باشیم
const inventoryLogRepository = require('../repositories/inventoryLogRepository');
const { sanitizeString } = require('../utils/sanitizer');

class ProductService {
    constructor(productRepo, inventoryLogRepo) {
        this.productRepository = productRepo;
        this.inventoryLogRepository = inventoryLogRepo;
    }

    /**
     * @description Handles business logic for fetching all products, including price transformation.
     */
    async getAllProducts(filters, pagination, sorting) {
        const productsResult = await this.productRepository.findAndCountAllWithFilters(filters, pagination, sorting);

        // منطق تجاری: تبدیل قیمت‌ها برای نمایش
        const productsWithPrices = productsResult.rows.map((product) => {
            const plainProduct = product.get({ plain: true });
            const cp = plainProduct.campaignProduct;

            if (cp && cp.campaign && cp.campaign_price != null) {
                return {
                    ...plainProduct,
                    display_price: cp.campaign_price,
                    original_price: plainProduct.price,
                    campaign_price: cp.campaign_price,
                    campaign_id: cp.campaign.id,
                };
            }

            delete plainProduct.campaignProduct;
            return {
                ...plainProduct,
                display_price: plainProduct.price,
            };
        });

        return {
            count: productsResult.count,
            rows: productsWithPrices
        };
    }

    /**
     * @description Handles logic for fetching a single product, incrementing views, and transforming price.
     */
    async getProductById(id) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            const error = new Error('Product not found.');
            error.statusCode = 404;
            throw error;
        }

        // منطق تجاری: افزایش بازدید
        product.views_count += 1;
        await product.save();

        // منطق تجاری: تبدیل قیمت‌ها برای نمایش
        const plainProduct = product.get({ plain: true });
        const cp = plainProduct.campaignProduct;
        let productResponse;

        if (cp && cp.campaign && cp.campaign_price != null) {
            productResponse = {
                ...plainProduct,
                display_price: cp.campaign_price,
                original_price: plainProduct.price,
                campaign_price: cp.campaign_price,
                campaign_info: { id: cp.campaign.id, title: cp.campaign.title },
            };
        } else {
            productResponse = {
                ...plainProduct,
                display_price: plainProduct.price,
            };
        }
        delete productResponse.campaignProduct;
        return productResponse;
    }

    /**
     * @description Handles logic for creating a new product.
     */
    async createProduct(productData, userId) {
        const t = await db.sequelize.transaction();
        try {
            const sanitizedData = {
                name: sanitizeString(productData.name),
                description: sanitizeString(productData.description),
                slug: sanitizeString(productData.slug),
                price: productData.price,
                stock_quantity: productData.stock_quantity,
                category_id: productData.category_id,
                brand_id: productData.brand_id,
                buy_price: productData.buy_price ? parseFloat(productData.buy_price) : 0,
                image_url: productData.image_url,
            };

            const existing = await this.productRepository.findByNameOrSlug(sanitizedData.name, sanitizedData.slug, null, t);
            if (existing) {
                const error = new Error('Product with this name or slug already exists.');
                error.statusCode = 409;
                throw error;
            }

            const newProduct = await this.productRepository.create(sanitizedData, { transaction: t });

            await this.inventoryLogRepository.create({
                product_id: newProduct.id,
                change_type: 'initial_stock',
                quantity_change: newProduct.stock_quantity,
                old_stock_quantity: 0,
                new_stock_quantity: newProduct.stock_quantity,
                changed_by_user_id: userId,
                description: `Product created with initial stock.`,
            }, { transaction: t });

            await t.commit();
            return newProduct;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * @description Handles all business logic for updating a product, including transactions.
     */
    async updateProduct(id, updateData, userId) {
        // ۱. شروع تراکنش در سطح سرویس
        const t = await db.sequelize.transaction();

        try {
            const product = await this.productRepository.findById(id, { transaction: t });
            if (!product) {
                const error = new Error('Product not found.');
                error.statusCode = 404;
                throw error;
            }

            // ۲. بررسی تکراری بودن نام یا اسلاگ (منطق تجاری)
            if ((updateData.name && updateData.name !== product.name) || (updateData.slug && updateData.slug !== product.slug)) {
                const existing = await this.productRepository.findByNameOrSlug(updateData.name, updateData.slug, id, t);
                if (existing) {
                    const error = new Error('Product with this name or slug already exists.');
                    error.statusCode = 409;
                    throw error;
                }
            }

            // ۳. منطق تجاری پیچیده برای محاسبه قیمت خرید و موجودی
            const oldStock = product.stock_quantity;
            const oldBuyPrice = product.buy_price || 0;
            let quantityChange = 0;

            if (updateData.stock_quantity !== undefined) {
                quantityChange = parseInt(updateData.stock_quantity, 10) - oldStock;
            }

            const newStockQuantity = oldStock + quantityChange;
            if (newStockQuantity < 0) {
                throw new Error('Stock quantity cannot be negative.');
            }

            if (updateData.buy_price !== undefined) {
                const incomingBuyPrice = parseFloat(updateData.buy_price);
                if (quantityChange > 0) { // افزایش موجودی
                    product.buy_price = ((oldStock * oldBuyPrice) + (quantityChange * incomingBuyPrice)) / newStockQuantity;
                } else { // کاهش موجودی یا فقط تغییر قیمت خرید
                    product.buy_price = incomingBuyPrice;
                }
            }

            product.stock_quantity = newStockQuantity;

            // ۴. ثبت لاگ انبار (عملیات دیتابیس دوم)
            if (quantityChange !== 0 || (updateData.buy_price !== undefined && parseFloat(updateData.buy_price) !== oldBuyPrice)
            ) {
                await this.inventoryLogRepository.create({
                    product_id: product.id,
                    change_type: 'manual_adjustment',
                    quantity_change: quantityChange,
                    old_stock_quantity: oldStock,
                    new_stock_quantity: product.stock_quantity,
                    changed_by_user_id: userId,
                    description: `Product updated. Old buy price: ${oldBuyPrice}, New: ${product.buy_price}`
                }, { transaction: t });
            }

            // به‌روزرسانی سایر فیلدها
            product.name = sanitizeString(updateData.name || product.name);
            product.description = sanitizeString(updateData.description || product.description);
            product.slug = sanitizeString(updateData.slug || product.slug);
            product.price = updateData.price ?? product.price;
            product.category_id = updateData.category_id || product.category_id;
            product.brand_id = updateData.brand_id || product.brand_id;
            product.image_url = updateData.image_url || product.image_url;

            // ۵. ذخیره نهایی محصول (عملیات دیتابیس سوم)
            const updatedProduct = await this.productRepository.save(product, { transaction: t });

            // ۶. کامیت کردن تراکنش
            await t.commit();
            return updatedProduct;

        } catch (error) {
            // ۷. رول‌بک در صورت بروز هرگونه خطا
            await t.rollback();
            throw error; // ارجاع خطا به کنترلر برای ارسال پاسخ مناسب
        }
    }

    /**
     * @description Handles business logic for deleting a product.
     */
    async deleteProduct(id) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            const error = new Error('Product not found.');
            error.statusCode = 404;
            throw error;
        }

        // منطق جانبی: حذف فایل تصویر از سرور (در صورت نیاز)
        // if (product.image_url) {
        //   const imagePath = path.join(__dirname, '..', '..', 'public', product.image_url);
        //   try { await fs.unlink(imagePath); } catch (e) { logger.warn(`Could not delete image file: ${imagePath}`); }
        // }

        await this.productRepository.delete(product);
        return true;
    }
}

// برای کار کردن این سرویس، باید یک inventoryLogRepository هم بسازیم
module.exports = new ProductService(productRepository, inventoryLogRepository);