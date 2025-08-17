// src/repositories/couponCategoryRepository.js
const { CouponCategory } = require('../../models');

class CouponCategoryRepository {
    async findAllByCouponId(couponId, options = {}) {
        return await CouponCategory.findAll({
            where: { coupon_id: couponId },
            ...options,
        });
    }

    async create(data, options = {}) {
        return await CouponCategory.create(data, options);
    }

    async delete(instance, options = {}) {
        return await instance.destroy(options);
    }
}

module.exports = new CouponCategoryRepository();
