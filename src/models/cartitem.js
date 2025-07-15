// src/models/cartitem.js
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This file is not a part of a Sequelize migration.
     * It is where we define the relationships between models.
     */
    static associate(models) {
      // یک آیتم سبد خرید به یک سبد خرید تعلق دارد
      CartItem.belongsTo(models.Cart, {
        foreignKey: 'cart_id',
        as: 'cart'
      });
      // یک آیتم سبد خرید به یک محصول تعلق دارد
      CartItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }
  CartItem.init({
    // ID به صورت خودکار توسط Sequelize به عنوان Primary Key و Auto-Increment مدیریت می‌شود
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'CartItem', // نام مدل
    tableName: 'CartItems', // نام واقعی جدول در دیتابیس (جمع)
    timestamps: true // برای مدیریت createdAt و updatedAt
  });
  return CartItem;
};