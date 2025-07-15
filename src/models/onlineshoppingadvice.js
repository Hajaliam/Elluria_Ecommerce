// src/models/onlineshoppingadvice.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OnlineShoppingAdvice extends Model {
    static associate(models) {
      OnlineShoppingAdvice.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
    }
  }
  OnlineShoppingAdvice.init(
    {
      user_id: {
        // 👈 این فیلد را اصلاح می‌کنیم
        type: DataTypes.INTEGER,
        allowNull: true, // 👈 **اینجا را به `true` تغییر دهید!**
      },
      session_id: {
        // 👈 **این فیلد جدید را اضافه کنید!**
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      chat_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      object: {
        type: DataTypes.TEXT,
        allowNull: true, // 👈 این را هم به `true` تغییر دهید اگر لازم است
      },
    },
    {
      sequelize,
      modelName: 'OnlineShoppingAdvice',
      tableName: 'OnlineShoppingAdvices', // نام واقعی جدول در دیتابیس
      timestamps: true,
    },
  );
  return OnlineShoppingAdvice;
};
