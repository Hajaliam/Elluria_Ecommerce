// src/models/orderhistory.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderHistory extends Model {
    static associate(models) {
      OrderHistory.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      OrderHistory.belongsTo(models.User, {
        foreignKey: 'changed_by',
        as: 'changer'
      });
    }
  }
  OrderHistory.init({
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false },
    changed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    changed_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    sequelize,
    modelName: 'OrderHistory',
    tableName: 'OrderHistories',
    timestamps: true // اضافه شدن برای استانداردسازی
  });
  return OrderHistory;
};