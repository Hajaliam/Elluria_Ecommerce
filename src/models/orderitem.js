// src/models/orderitem.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order',
      });
      OrderItem.belongsTo(models.ProductVariant, {
        foreignKey: 'variant_id',
        as: 'variant',
      });
    }
  }
  OrderItem.init(
      {
        order_id: { type: DataTypes.INTEGER, allowNull: false },
        variant_id: { type: DataTypes.INTEGER, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        price_at_purchase: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      },
      {
        sequelize,
        modelName: 'OrderItem',
        tableName: 'OrderItems',
        timestamps: true,
      },
  );
  return OrderItem;
};