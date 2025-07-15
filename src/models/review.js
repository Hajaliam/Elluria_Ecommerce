// src/models/review.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      Review.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
      });
    }
  }
  Review.init(
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      product_id: { type: DataTypes.INTEGER, allowNull: false },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Review',
      tableName: 'Reviews',
      timestamps: true,
      indexes: [
        {
          // برای اطمینان از یک review برای هر کاربر و محصول
          unique: true,
          fields: ['user_id', 'product_id'],
        },
      ],
    },
  );
  return Review;
};
