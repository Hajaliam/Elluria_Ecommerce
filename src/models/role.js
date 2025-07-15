// src/models/role.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // یک نقش می‌تواند شامل چندین کاربر باشد (One-to-Many)
      Role.hasMany(models.User, {
        foreignKey: 'role_id', // ستون foreign key در جدول User
        as: 'users', // نامی برای دسترسی به کاربران مرتبط (e.g., role.users)
      });
    }
  }
  Role.init(
    {
      // ID به صورت خودکار توسط Sequelize به عنوان Primary Key و Auto-Increment مدیریت می‌شود
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize, // نمونه Sequelize که برای اتصال به دیتابیس استفاده می‌شود
      modelName: 'Role', // نام مدل (مفرد)
      tableName: 'Roles', // نام واقعی جدول در دیتابیس (جمع و با حرف بزرگ طبق مهاجرت شما)
      timestamps: true, // برای مدیریت createdAt و updatedAt به صورت خودکار
    },
  );
  return Role;
};
