// src/models/brand.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Brand extends Model {
        static associate(models) {
            Brand.hasMany(models.Product, {
                foreignKey: 'brand_id',
                as: 'products'
            });
        }
    }
    Brand.init({
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Brand',
        tableName: 'Brands', // نام جدول در دیتابیس
        timestamps: true
    });
    return Brand;
};