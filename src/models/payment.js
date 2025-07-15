// src/models/payment.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
    }
  }
  Payment.init({
    order_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    transaction_id: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    method: { type: DataTypes.STRING(50), allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false },
    payment_date: { type: DataTypes.DATE, allowNull: false },
    refunded: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    refund_reason: { type: DataTypes.TEXT, allowNull: true }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments',
    timestamps: true
  });
  return Payment;
};