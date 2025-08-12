// src/models/product.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
      });
      Product.belongsTo(models.Brand, {
        foreignKey: 'brand_id',
        as: 'brand',
      });
      Product.belongsTo(models.Campaign, {
          foreignKey: 'campaign_id',
          as: 'campaign'
      });

      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id',
        as: 'orderItems',
      });
      Product.hasMany(models.Review, {
        foreignKey: 'product_id',
        as: 'reviews',
      });
      Product.belongsToMany(models.Coupon, {
          through: models.CouponProduct,
          foreignKey: 'product_id',
          otherKey: 'coupon_id',
          as: 'coupons'
      })
      Product.hasOne(models.CampaignProduct, {
          foreignKey: 'product_id',
          as: 'campaignProduct',
      });
      Product.hasMany(models.ProductVariant, {
          foreignKey: 'product_id',
          as: 'variants'
      });

    }
  }
  Product.init(
    {
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      stock_quantity: { type: DataTypes.INTEGER, allowNull: false },
      image_url: { type: DataTypes.TEXT },
      category_id: { type: DataTypes.INTEGER, allowNull: false },
      views_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sold_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },

      brand_id: {
        // 👈 فیلد جدید
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      campaign_id: { // 👈 فیلد جدید
          type: DataTypes.INTEGER,
          allowNull: true // می‌تواند null باشد اگر محصولی در کمپین نباشد
      },
      buy_price: { // 👈 فیلد جدید
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          defaultValue: 0
      }
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'Products',
      timestamps: true,
    },
  );
  return Product;
};
