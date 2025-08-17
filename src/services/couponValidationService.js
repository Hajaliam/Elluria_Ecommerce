// src/services/couponValidationService.js

const couponRepository = require('../repositories/couponRepository');
const userCouponUsageRepository = require('../repositories/userCouponUsageRepository');
const { Op } = require('sequelize');
const ValidationError = require('../errors/ValidationError');

class CouponValidationService {
    /**
     * اعتبارسنجی کوپن
     * @param {string} code - کد کوپن
     * @param {number} userId - شناسه کاربر
     * @param {Array<number>} productIds - لیست محصولات سفارش
     * @param {number} orderTotal - جمع کل سفارش
     */
    async validateCoupon(code, userId, productIds, orderTotal, options = {}) {
        // کوپن با همه روابطش
        const coupon = await couponRepository.findByCodeWithRelations(code, options);

        if (!coupon) {
            throw new ValidationError('کد کوپن نامعتبر است.');
        }

        // تاریخ شروع و پایان
        const now = new Date();
        if (coupon.start_date && coupon.start_date > now) {
            throw new ValidationError('این کوپن هنوز فعال نشده است.');
        }
        if (coupon.end_date && coupon.end_date < now) {
            throw new ValidationError('مهلت استفاده از این کوپن به پایان رسیده است.');
        }

        // محدودیت تعداد کل
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            throw new ValidationError('ظرفیت استفاده از این کوپن به پایان رسیده است.');
        }

        // محدودیت برای هر کاربر
        if (coupon.usage_limit_per_user) {
            const userUsageCount = await userCouponUsageRepository.countByUserAndCoupon(
                userId,
                coupon.id,
                options
            );
            if (userUsageCount >= coupon.usage_limit_per_user) {
                throw new ValidationError('شما به سقف مجاز استفاده از این کوپن رسیده‌اید.');
            }
        }

        // حداقل مبلغ سفارش
        if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
            throw new ValidationError(`حداقل مبلغ سفارش برای استفاده از این کوپن ${coupon.min_order_amount} است.`);
        }

        // بررسی محصولات یا دسته‌بندی‌های مجاز
        if (coupon.products?.length > 0) {
            const couponProductIds = coupon.products.map(p => p.id);
            const hasValidProduct = productIds.some(pid => couponProductIds.includes(pid));
            if (!hasValidProduct) {
                throw new ValidationError('این کوپن برای محصولات انتخابی قابل استفاده نیست.');
            }
        }

        if (coupon.categories?.length > 0) {
            const couponCategoryIds = coupon.categories.map(c => c.id);
            const hasValidCategory = coupon.products.some(product =>
                couponCategoryIds.includes(product.category_id)
            );
            if (!hasValidCategory) {
                throw new ValidationError('این کوپن برای دسته‌بندی محصولات انتخابی قابل استفاده نیست.');
            }
        }

        // کوپن‌های خصوصی
        if (coupon.users?.length > 0) {
            const userIds = coupon.users.map(u => u.id);
            if (!userIds.includes(userId)) {
                throw new ValidationError('این کوپن برای شما معتبر نیست.');
            }
        }

        return coupon;
    }
}

module.exports = new CouponValidationService();
