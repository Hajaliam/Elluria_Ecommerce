// src/models/couponcategory.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CouponCategory extends Model {
        static associate(models) {
            CouponCategory.belongsTo(models.Coupon, {
                foreignKey: 'coupon_id',
                as: 'coupon'
            });
            CouponCategory.belongsTo(models.Category, {
                foreignKey: 'category_id',
                as: 'category'
            });
        }
    }
    CouponCategory.init({
        coupon_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    }, {
        sequelize,
        modelName: 'CouponCategory',
        tableName: 'CouponCategories',
        timestamps: true,
        indexes: [{ unique: true, fields: ['coupon_id', 'category_id'] }]
    });
    return CouponCategory;
};