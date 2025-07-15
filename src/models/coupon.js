// src/models/coupon.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.hasMany(models.Order, {
        foreignKey: 'coupon_id',
        as: 'orders'
      });
    }
  }
  Coupon.init({
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    discount_type: { type: DataTypes.STRING(50), allowNull: false },
    discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    min_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    usage_limit: { type: DataTypes.INTEGER, allowNull: true },
    used_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Coupon',
    tableName: 'Coupons',
    timestamps: true
  });
  return Coupon;
};