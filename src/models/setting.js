// src/models/setting.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {
      // این جدول معمولاً ارتباط مستقیم با جداول دیگر ندارد
    }
  }
  Setting.init({
    key: { type: DataTypes.STRING(100), primaryKey: true, allowNull: false, unique: true },
    value: { type: DataTypes.TEXT, allowNull: false }
  }, {
    sequelize,
    modelName: 'Setting',
    tableName: 'Settings',
    timestamps: true
  });
  return Setting;
};