// src/repositories/userCouponRepository.js
const { UserCoupon } = require('../../models');

class UserCouponRepository {
    async findByUserIdAndCouponId(userId, couponId, options = {}) {
        return await UserCoupon.findOne({
            where: { user_id: userId, coupon_id: couponId },
            ...options,
        });
    }

    async findAllByCouponId(couponId, options = {}) {
        return await UserCoupon.findAll({
            where: { coupon_id: couponId },
            ...options,
        });
    }

    async create(data, options = {}) {
        return await UserCoupon.create(data, options);
    }

    async delete(instance, options = {}) {
        return await instance.destroy(options);
    }
}

module.exports = new UserCouponRepository();
