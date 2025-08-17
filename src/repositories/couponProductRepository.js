// src/repositories/couponProductRepository.js
const { CouponProduct } = require('../../models');

class CouponProductRepository {
    async findAllByCouponId(couponId, options = {}) {
        return await CouponProduct.findAll({
            where: { coupon_id: couponId },
            ...options,
        });
    }

    async create(data, options = {}) {
        return await CouponProduct.create(data, options);
    }

    async delete(instance, options = {}) {
        return await instance.destroy(options);
    }
}

module.exports = new CouponProductRepository();
