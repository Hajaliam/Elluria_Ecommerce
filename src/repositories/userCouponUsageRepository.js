// src/repositories/userCouponUsageRepository.js
const { UserCouponUsage } = require('../../models');

class UserCouponUsageRepository {
    async findOrCreate(where, defaults, options = {}) {
        const [instance, created] = await UserCouponUsage.findOrCreate({ where, defaults, ...options });
        return [instance, created];
    }

    async increment(instance, field, options = {}) {
        return await instance.increment(field, options);
    }
    async countByUserAndCoupon(userId, couponId, options = {}) {
        const count = await UserCouponUsage.count({
            where: { user_id: userId, coupon_id: couponId },
            ...options,
        });
        return count ;
    }

}

module.exports = new UserCouponUsageRepository();