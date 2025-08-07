// src/models/attribute.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Attribute extends Model {
        static associate(models) {
            // یک ویژگی مقادیر زیادی دارد (مثال: رنگ -> قرمز، آبی، سبز)
            Attribute.hasMany(models.AttributeValue, {
                foreignKey: 'attribute_id',
                as: 'values'
            });
        }
    }
    Attribute.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        sequelize,
        modelName: 'Attribute',
        tableName: 'Attributes',
        timestamps: true
    });
    return Attribute;
};