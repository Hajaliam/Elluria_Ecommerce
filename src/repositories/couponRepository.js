// src/repositories/couponRepository.js

const { Coupon, Brand, Product, User, Category } = require('../../models');

class CouponRepository {
    /**
     * @description Create a new coupon. Associations (brands, products, etc.) are handled in the service.
     * @param {object} data - Coupon data
     * @param {object} options - Sequelize options, e.g., { transaction: t }
     * @returns {Promise<Coupon>}
     */
    async create(data, options = {}) {
        return await Coupon.create(data, options);
    }

    /**
     * @description Find a coupon by its ID, including all its associations.
     * @param {number} id
     * @param {object} options - Sequelize options, e.g., { transaction: t }
     * @returns {Promise<Coupon|null>}
     */
    async findById(id, options = {}) {
        return await Coupon.findByPk(id, {
            ...options,
            include: ['brands', 'products', 'users', 'categories']
        });
    }

    /**
     * @description Find a coupon by its unique code.
     * @param {string} code
     * @param {object} options - Sequelize options, e.g., { transaction: t }
     * @returns {Promise<Coupon|null>}
     */
    async findByCode(code, options = {}) {
        return await Coupon.findOne({ where: { code }, ...options });
    }

    /**
     * @description Find all coupons.
     * @returns {Promise<Coupon[]>}
     */
    async findAll() {
        return await Coupon.findAll();
    }

    /**
     * @description Save an updated coupon instance.
     * @param {Coupon} couponInstance
     * @param {object} options - Sequelize options, e.g., { transaction: t }
     * @returns {Promise<Coupon>}
     */
    async save(couponInstance, options = {}) {
        return await couponInstance.save(options);
    }

    /**
     * @description Delete a coupon instance.
     * @param {Coupon} couponInstance
     * @param {object} options - Sequelize options, e.g., { transaction: t }
     * @returns {Promise<void>}
     */
    async delete(couponInstance, options = {}) {
        return await couponInstance.destroy(options);
    }
}

module.exports = new CouponRepository();