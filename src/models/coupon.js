// src/models/coupon.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.hasMany(models.Order, {
        foreignKey: 'coupon_id',
        as: 'orders',
      });
        // 👈 ارتباط با CouponGroup
        Coupon.belongsTo(models.CouponGroup, {
            foreignKey: 'coupon_group_id',
            as: 'group'
        });
        // 👈 ارتباط با CouponProducts
        Coupon.hasMany(models.CouponProduct, {
            foreignKey: 'coupon_id',
            as: 'couponProducts'
        });
        // 👈 ارتباط با UserCoupons
        Coupon.hasMany(models.UserCoupon, {
            foreignKey: 'coupon_id',
            as: 'userCoupons'
        });
        // 👈 ارتباط با UserCouponUsages
        Coupon.hasMany(models.UserCouponUsage, {
            foreignKey: 'coupon_id',
            as: 'userUsages'
        });
        Coupon.hasMany(models.CouponCategory, {
            foreignKey: 'coupon_id',
            as: 'couponCategories'
        });
        Coupon.belongsToMany(models.Product, {
            through: models.CouponProduct,
            foreignKey: 'coupon_id',
            otherKey: 'product_id',
            as: 'products'
        });
        Coupon.belongsToMany(models.User, {
            through: models.UserCoupon,
            foreignKey: 'coupon_id',
            otherKey: 'user_id',
            as: 'users'
        });
        Coupon.belongsToMany(models.Category, {
            through: models.CouponCategory,
            foreignKey: 'coupon_id',
            otherKey: 'category_id',
            as: 'categories'
        });
    }
  }
  Coupon.init(
    {
      code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      discount_type: { type: DataTypes.STRING(50), allowNull: false },
      discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      min_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      usage_limit: { type: DataTypes.INTEGER, allowNull: true },
      used_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_first_purchase_only: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
        is_exclusive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        max_usage_per_user: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        coupon_group_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        max_discount_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        }
    },
    {
      sequelize,
      modelName: 'Coupon',
      tableName: 'Coupons',
      timestamps: true,
    },
  );
  return Coupon;
};
