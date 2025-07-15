// src/models/user.js
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt'); // برای هش کردن و مقایسه پسورد

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // یک کاربر به یک نقش تعلق دارد (Many-to-One)
      User.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role', // نامی برای دسترسی به نقش کاربر (e.g., user.role)
      });
      // یک کاربر می‌تواند چندین آدرس داشته باشد
      User.hasMany(models.Address, {
        foreignKey: 'user_id',
        as: 'addresses',
      });
      // یک کاربر می‌تواند چندین سبد خرید داشته باشد
      User.hasMany(models.Cart, {
        foreignKey: 'user_id',
        as: 'carts',
      });
      // یک کاربر می‌تواند چندین سفارش داشته باشد
      User.hasMany(models.Order, {
        foreignKey: 'user_id',
        as: 'orders',
      });
      // یک کاربر می‌تواند چندین بررسی (Review) بدهد
      User.hasMany(models.Review, {
        foreignKey: 'user_id',
        as: 'reviews',
      });
      // یک کاربر می‌تواند چندین OnlineShoppingAdvice داشته باشد
      User.hasMany(models.OnlineShoppingAdvice, {
        foreignKey: 'user_id',
        as: 'advice',
      });
      // یک کاربر می‌تواند چندین OrderHistory را تغییر دهد (اختیاری)
      User.hasMany(models.OrderHistory, {
        foreignKey: 'changed_by', // ستونی که به User اشاره می‌کند
        as: 'orderChanges',
      });
    }

    // متدی برای مقایسه پسورد (در کنترلرها استفاده می‌شود)
    isValidPassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }
  User.init(
    {
      // ID به صورت خودکار توسط Sequelize به عنوان Primary Key و Auto-Increment مدیریت می‌شود
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING(20),
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      otp_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
    },
  );
  return User;
};
