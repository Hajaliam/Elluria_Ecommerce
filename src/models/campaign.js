// src/models/campaign.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Campaign extends Model {
        static associate(models) {
            // یک کمپین می‌تواند شامل چندین محصول باشد (Many-to-Many از طریق CampaignProduct)
            Campaign.belongsToMany(models.Product, {
                through: models.CampaignProduct,
                foreignKey: 'campaign_id',
                otherKey: 'product_id',
                as: 'products'
            });
        }
    }
    Campaign.init({
        title: { // 👈 عنوان کمپین [cite: 1, 69]
            type: DataTypes.STRING,
            allowNull: false
        },
        description: { // 👈 توضیح کمپین [cite: 1, 69]
            type: DataTypes.TEXT,
            allowNull: true
        },
        slug: { // 👈 slug کمپین [cite: 1, 69]
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        banner_image_url: { // 👈 عکس بنر [cite: 1, 69]
            type: DataTypes.STRING,
            allowNull: true
        },
        campaign_type: { // 👈 campaign_type (مثل today_offer، seasonal، clearance، bestsellers و ...) [cite: 1, 69]
            type: DataTypes.STRING(50),
            allowNull: false
        },
        start_date: { // 👈 تاریخ شروع کمپین [cite: 1, 69]
            type: DataTypes.DATE,
            allowNull: false
        },
        end_date: { // 👈 تاریخ پایان کمپین [cite: 1, 69]
            type: DataTypes.DATE,
            allowNull: false
        },
        show_countdown: { // 👈 نمایش تایمر معکوس (boolean) [cite: 1, 69]
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        priority: { // 👈 اولویت نمایش [cite: 1, 69]
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        cta_link: { // 👈 لینک CTA [cite: 1, 69]
            type: DataTypes.STRING,
            allowNull: true
        },
        is_active: { // 👈 وضعیت فعال بودن کمپین [cite: 1, 69]
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Campaign',
        tableName: 'Campaigns', // نام جدول در دیتابیس
        timestamps: true
    });
    return Campaign;
};