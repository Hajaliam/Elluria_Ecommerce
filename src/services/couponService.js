// src/services/couponService.js

const db = require('../../models');
const couponRepository = require('../repositories/couponRepository');
const productRepository = require('../repositories/productRepository');
const brandRepository = require('../repositories/brandRepository');
const categoryRepository = require('../repositories/categoryRepository');
const userRepository = require('../repositories/userRepository');
const { sanitizeString } = require('../utils/sanitizer');
const { getDescendantCategoryIds } = require('../utils/descendantCategoryIds');

class CouponService {
    constructor() {
        this.couponRepository = couponRepository;
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    async createCoupon(data) {
        const t = await db.sequelize.transaction();
        try {
            const {
                code, discount_type, discount_value, min_amount, usage_limit,
                expiry_date, isActive, is_first_purchase_only, is_exclusive,
                max_usage_per_user, coupon_group_id, product_ids = [], user_ids = [],
                category_ids = [], brand_ids = [], max_discount_amount
            } = data;

            const sanitizedCode = sanitizeString(code);
            const existingCoupon = await this.couponRepository.findByCode(sanitizedCode, { transaction: t });
            if (existingCoupon) {
                const error = new Error('Coupon with this code already exists.');
                error.statusCode = 409;
                throw error;
            }

            const newCouponData = {
                code: sanitizedCode, discount_type: sanitizeString(discount_type),
                discount_value: discount_type === 'free_shipping' ? 0 : parseFloat(discount_value),
                min_amount: min_amount ? parseFloat(min_amount) : 0,
                usage_limit: usage_limit ? parseInt(usage_limit) : null,
                expiry_date: expiry_date ? new Date(expiry_date) : null,
                isActive: !!isActive, is_first_purchase_only: !!is_first_purchase_only,
                is_exclusive: !!is_exclusive,
                max_usage_per_user: max_usage_per_user ? parseInt(max_usage_per_user) : null,
                coupon_group_id: coupon_group_id || null,
                max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null
            };

            const newCoupon = await this.couponRepository.create(newCouponData, { transaction: t });

            if (brand_ids && brand_ids.length > 0) {

                const brands = await this.brandRepository.findAll({ where: { id: brand_ids } });

                if (brands.length !== brand_ids.length) {
                    console.log('[6] CONDITION MET. Throwing error...');
                    const error = new Error('One or more brands not found.');
                    error.statusCode = 404;
                    throw error;
                }


                await newCoupon.setBrands(brands, { transaction: t });
            }
            if (product_ids.length > 0) {
                const products = await this.productRepository.findAll({ where: { id: product_ids } });
                if (products.length !== product_ids.length) { throw new Error('One or more products not found.'); }
                await newCoupon.setProducts(products, { transaction: t });
            }
            if (user_ids.length > 0) {
                const users = await this.userRepository.findAll({ where: { id: user_ids } });
                if (users.length !== user_ids.length) { throw new Error('One or more users not found.'); }
                await newCoupon.setUsers(users, { transaction: t });
            }
            if (category_ids.length > 0) {
                const allCategories = await this.categoryRepository.findAllSimple({ transaction: t });
                const allDescendantIds = getDescendantCategoryIds(category_ids, allCategories);
                const categories = await this.categoryRepository.findAll({ where: { id: allDescendantIds } });
                await newCoupon.setCategories(categories, { transaction: t });
            }

            await t.commit();
            return await this.couponRepository.findById(newCoupon.id);
        } catch (error) {
            await t.rollback();
            if (!error.statusCode) error.statusCode = 500;
            throw error;
        }
    }

    async updateCoupon(id, data) {
        const t = await db.sequelize.transaction();
        try {
            const coupon = await this.couponRepository.findById(id, { transaction: t });
            if (!coupon) {
                const error = new Error('Coupon not found.');
                error.statusCode = 404;
                throw error;
            }

            const sanitizedCode = sanitizeString(data.code);
            if (sanitizedCode && sanitizedCode !== coupon.code) {
                const existingCoupon = await this.couponRepository.findByCode(sanitizedCode, { transaction: t });
                if (existingCoupon) {
                    const error = new Error('Coupon with this new code already exists.');
                    error.statusCode = 409;
                    throw error;
                }
            }

            coupon.code = sanitizedCode || coupon.code;
            coupon.discount_type = sanitizeString(data.discount_type) || coupon.discount_type;
            coupon.discount_value = data.discount_type === 'free_shipping' ? 0 : (parseFloat(data.discount_value) || coupon.discount_value);
            coupon.min_amount = data.min_amount ? parseFloat(data.min_amount) : coupon.min_amount;
            coupon.usage_limit = data.usage_limit ? parseInt(data.usage_limit) : coupon.usage_limit;
            coupon.expiry_date = data.expiry_date ? new Date(data.expiry_date) : coupon.expiry_date;
            coupon.isActive = 'isActive' in data ? !!data.isActive : coupon.isActive;
            coupon.is_first_purchase_only = 'is_first_purchase_only' in data ? !!data.is_first_purchase_only : coupon.is_first_purchase_only;
            coupon.is_exclusive = 'is_exclusive' in data ? !!data.is_exclusive : coupon.is_exclusive;
            coupon.max_usage_per_user = data.max_usage_per_user ? parseInt(data.max_usage_per_user) : coupon.max_usage_per_user;
            coupon.coupon_group_id = data.coupon_group_id || coupon.coupon_group_id;
            coupon.max_discount_amount = data.max_discount_amount ? parseFloat(data.max_discount_amount) : coupon.max_discount_amount;

            await this.couponRepository.save(coupon, { transaction: t });

            if ('brand_ids' in data) {
                const brands = await this.brandRepository.findAll({ where: { id: data.brand_ids } });
                await coupon.setBrands(brands, { transaction: t });
            }
            if ('product_ids' in data) {
                const products = await this.productRepository.findAll({ where: { id: data.product_ids } });
                await coupon.setProducts(products, { transaction: t });
            }
            if ('user_ids' in data) {
                const users = await this.userRepository.findAll({ where: { id: data.user_ids } });
                await coupon.setUsers(users, { transaction: t });
            }
            if ('category_ids' in data) {
                const allCategories = await this.categoryRepository.findAllSimple({ transaction: t });
                const allDescendantIds = getDescendantCategoryIds(data.category_ids, allCategories);
                const categories = await this.categoryRepository.findAll({ where: { id: allDescendantIds } });
                await coupon.setCategories(categories, { transaction: t });
            }

            await t.commit();
            return await this.couponRepository.findById(id);
        } catch (error) {
            await t.rollback();
            if (!error.statusCode) error.statusCode = 500;
            throw error;
        }
    }

    async getAllCoupons() {
        return await this.couponRepository.findAll();
    }

    async getCouponByCode(code) {
        const coupon = await this.couponRepository.findByCode(code);
        if (!coupon) {
            const error = new Error('Coupon not found.');
            error.statusCode = 404;
            throw error;
        }
        return coupon;
    }

    async deleteCoupon(code) {
        const t = await db.sequelize.transaction();
        try {
            const coupon = await this.couponRepository.findByCode(code, { transaction: t });
            if (!coupon) {
                const error = new Error('Coupon not found.');
                error.statusCode = 404;
                throw error;
            }
            await this.couponRepository.delete(coupon, { transaction: t });
            await t.commit();
            return true;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

module.exports = new CouponService();