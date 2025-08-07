// src/models/couponbrand.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CouponBrand extends Model {
        static associate(models) {
            // تعریف روابط از مدل واسط (اختیاری ولی برای کوئری‌های پیچیده مفید است)
            CouponBrand.belongsTo(models.Coupon, {
                foreignKey: 'coupon_id',
                as: 'coupon'
            });
            CouponBrand.belongsTo(models.Brand, {
                foreignKey: 'brand_id',
                as: 'brand'
            });
        }
    }
    CouponBrand.init({
        // نیازی به تعریف ستون id نیست، Sequelize به صورت پیش‌فرض آن را اضافه می‌کند
        coupon_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true // بخشی از کلید اصلی ترکیبی
        },
        brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true // بخشی از کلید اصلی ترکیبی
        }
    }, {
        sequelize,
        modelName: 'CouponBrand',
        tableName: 'CouponBrands',
        timestamps: true,
        // برای اطمینان از اینکه هر زوج (coupon_id, brand_id) یکتا است
        indexes: [{
            unique: true,
            fields: ['coupon_id', 'brand_id']
        }]
    });
    return CouponBrand;
};