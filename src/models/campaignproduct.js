// src/models/campaignproduct.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CampaignProduct extends Model {
        static associate(models) {
            // ارتباط با Campaign
            CampaignProduct.belongsTo(models.Campaign, {
                foreignKey: 'campaign_id',
                as: 'campaign'
            });
            // ارتباط با Product
            CampaignProduct.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });

        }
    }
    CampaignProduct.init({
        campaign_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true // می‌تواند بخشی از primary key کامپوزیت باشد
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true // می‌تواند بخشی از primary key کامپوزیت باشد
        },
        original_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        campaign_price: {                  // افزودن فیلد قیمت کمپین
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'CampaignProduct',
        tableName: 'CampaignProducts', // نام جدول در دیتابیس
        timestamps: true,
        // برای تضمین unique بودن ترکیب (campaign_id, product_id)
        indexes: [{ unique: true, fields: ['campaign_id', 'product_id'] }]
    });
    return CampaignProduct;
};