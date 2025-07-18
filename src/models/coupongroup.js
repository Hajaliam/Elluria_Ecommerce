// src/models/coupongroup.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CouponGroup extends Model {
        static associate(models) {
            CouponGroup.hasMany(models.Coupon, {
                foreignKey: 'coupon_group_id',
                as: 'coupons'
            });
        }
    }
    CouponGroup.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'CouponGroup',
        tableName: 'CouponGroups',
        timestamps: true
    });
    return CouponGroup;
};