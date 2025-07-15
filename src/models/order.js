// src/models/order.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      Order.belongsTo(models.Address, {
        foreignKey: 'shipping_address_id',
        as: 'shippingAddress',
      });
      Order.belongsTo(models.Coupon, {
        foreignKey: 'coupon_id',
        as: 'coupon',
      });
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'orderItems',
      });
      Order.hasOne(models.Payment, {
        // یک سفارش یک پرداخت دارد
        foreignKey: 'order_id',
        as: 'payment',
      });
      Order.hasMany(models.OrderHistory, {
        foreignKey: 'order_id',
        as: 'history',
      });
    }
  }
  Order.init(
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: { type: DataTypes.STRING(50), allowNull: false },
      shipping_address_id: { type: DataTypes.INTEGER, allowNull: false },
      payment_status: { type: DataTypes.STRING(50), allowNull: false },
      coupon_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'Orders',
      timestamps: true,
    },
  );
  return Order;
};
