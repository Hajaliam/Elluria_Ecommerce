// src/models/usercouponusage.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserCouponUsage extends Model {
        static associate(models) {
            UserCouponUsage.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
            UserCouponUsage.belongsTo(models.Coupon, {
                foreignKey: 'coupon_id',
                as: 'coupon'
            });
        }
    }
    UserCouponUsage.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        coupon_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        usage_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'UserCouponUsage',
        tableName: 'UserCouponUsages',
        timestamps: true,
        indexes: [{ unique: true, fields: ['user_id', 'coupon_id'] }]
    });
    return UserCouponUsage;
};