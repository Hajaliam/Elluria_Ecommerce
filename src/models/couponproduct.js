// src/models/couponproduct.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CouponProduct extends Model {
        static associate(models) {
            CouponProduct.belongsTo(models.Coupon, {
                foreignKey: 'coupon_id',
                as: 'coupon'
            });
            CouponProduct.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
        }
    }
    CouponProduct.init({
        coupon_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    }, {
        sequelize,
        modelName: 'CouponProduct',
        tableName: 'CouponProducts',
        timestamps: true,
        indexes: [{ unique: true, fields: ['coupon_id', 'product_id'] }]
    });
    return CouponProduct;
};