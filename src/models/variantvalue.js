// src/models/variantvalue.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VariantValue extends Model {
        static associate(models) {
            VariantValue.belongsTo(models.ProductVariant, {
                foreignKey: 'variant_id',
                as: 'variant'
            });
            VariantValue.belongsTo(models.AttributeValue, {
                foreignKey: 'attribute_value_id',
                as: 'attributeValue'
            });
        }
    }
    VariantValue.init({
        variant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        attribute_value_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    }, {
        sequelize,
        modelName: 'VariantValue',
        tableName: 'VariantValues',
        timestamps: true,
        indexes: [{
            unique: true,
            fields: ['variant_id', 'attribute_value_id']
        }]
    });
    return VariantValue;
};