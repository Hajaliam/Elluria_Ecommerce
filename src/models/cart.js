// src/models/cart.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      Cart.hasMany(models.CartItem, {
        foreignKey: 'cart_id',
        as: 'cartItems',
      });
    }
  }
  Cart.init(
    {
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      session_id: { type: DataTypes.STRING(255), allowNull: true },
      expires_at: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Cart',
      tableName: 'Carts',
      timestamps: true,
    },
  );
  return Cart;
};
