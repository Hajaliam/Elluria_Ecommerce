// src/models/product.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      Product.hasMany(models.CartItem, {
        foreignKey: 'product_id',
        as: 'cartItems'
      });
      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id',
        as: 'orderItems'
      });
      Product.hasMany(models.Review, {
        foreignKey: 'product_id',
        as: 'reviews'
      });
    }
  }
  Product.init({
    name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock_quantity: { type: DataTypes.INTEGER, allowNull: false },
    image_url: { type: DataTypes.TEXT },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    views_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    sold_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'Products',
    timestamps: true
  });
  return Product;
};