// src/models/category.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Product, {
        foreignKey: 'category_id',
        as: 'products',
      });
      Category.hasMany(models.CouponCategory, {
        foreignKey: 'category_id',
        as: 'couponCategories'
      });
      Category.belongsTo(models.Category, {
        foreignKey: 'parent_id',
        as: 'parent',
      });
      Category.hasMany(models.Category, {
        foreignKey: 'parent_id',
        as: 'children',
      });
      Category.belongsToMany(models.Coupon, {
        through: models.CouponCategory,
        foreignKey: 'category_id',
        otherKey: 'coupon_id',
        as: 'coupons'
      });
    }
  }
  Category.init(
    {
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Categories', // توجه: باید با نام جدولت (tableName) بخونه
          key: 'id',
        },
        onDelete: 'SET NULL', // یا CASCADE، بستگی به نیازت داره
      }
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'Categories',
      timestamps: true,
    },
  );
  return Category;
};
