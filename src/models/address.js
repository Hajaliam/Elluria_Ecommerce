// src/models/address.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      Address.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Address.hasMany(models.Order, { // یک آدرس می‌تواند آدرس ارسال چندین سفارش باشد
        foreignKey: 'shipping_address_id',
        as: 'orders'
      });
    }
  }
  Address.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    street: { type: DataTypes.TEXT, allowNull: false },
    city: { type: DataTypes.STRING(100), allowNull: false },
    state: { type: DataTypes.STRING(100), allowNull: false },
    zip_code: { type: DataTypes.STRING(20), allowNull: false },
    country: { type: DataTypes.STRING(100), allowNull: false },
    is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    sequelize,
    modelName: 'Address',
    tableName: 'Addresses', // نام جدول در دیتابیس
    timestamps: true
  });
  return Address;
};