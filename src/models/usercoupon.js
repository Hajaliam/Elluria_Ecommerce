// src/models/usercoupon.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserCoupon extends Model {
        static associate(models) {
            UserCoupon.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
            UserCoupon.belongsTo(models.Coupon, {
                foreignKey: 'coupon_id',
                as: 'coupon'
            });
        }
    }
    UserCoupon.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        coupon_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    }, {
        sequelize,
        modelName: 'UserCoupon',
        tableName: 'UserCoupons',
        timestamps: true,
        indexes: [{ unique: true, fields: ['user_id', 'coupon_id'] }]
    });
    return UserCoupon;
};