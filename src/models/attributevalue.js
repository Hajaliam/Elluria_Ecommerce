// src/models/attributevalue.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AttributeValue extends Model {
        static associate(models) {
            // هر مقدار ویژگی به یک ویژگی تعلق دارد
            AttributeValue.belongsTo(models.Attribute, {
                foreignKey: 'attribute_id',
                as: 'attribute'
            });

            // هر مقدار ویژگی می‌تواند در چندین متغیر محصول استفاده شود
            AttributeValue.belongsToMany(models.ProductVariant, {
                through: models.VariantValue,
                foreignKey: 'attribute_value_id',
                otherKey: 'variant_id',
                as: 'variants'
            });
        }
    }
    AttributeValue.init({
        attribute_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'AttributeValue',
        tableName: 'AttributeValues',
        timestamps: true
    });
    return AttributeValue;
};