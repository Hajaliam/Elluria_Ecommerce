// src/models/cartitem.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      // یک آیتم سبد خرید به یک سبد خرید تعلق دارد
      CartItem.belongsTo(models.Cart, {
        foreignKey: 'cart_id',
        as: 'cart',
      });
      // 💎 تغییر اصلی: یک آیتم سبد خرید حالا به یک متغیر محصول تعلق دارد
      CartItem.belongsTo(models.ProductVariant, {
        foreignKey: 'variant_id',
        as: 'variant',
      });
    }
  }
  CartItem.init(
      {
        cart_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        variant_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'CartItem',
        tableName: 'CartItems',
        timestamps: true,
      },
  );
  return CartItem;
};