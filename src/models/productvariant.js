// src/models/productvariant.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductVariant extends Model {
        static associate(models) {
            // هر متغیر به یک محصول مادر تعلق دارد
            ProductVariant.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });

            // هر متغیر چندین مقدار ویژگی دارد (مثال: متغیر یک رژ لب -> رنگ:قرمز، فینیش:مات)
            ProductVariant.belongsToMany(models.AttributeValue, {
                through: models.VariantValue,
                foreignKey: 'variant_id',
                otherKey: 'attribute_value_id',
                as: 'values'
            });
        }
    }
    ProductVariant.init({
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'ProductVariant',
        tableName: 'ProductVariants',
        timestamps: true
    });
    return ProductVariant;
};