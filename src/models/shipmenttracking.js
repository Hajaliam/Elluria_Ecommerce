// src/models/shipmenttracking.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ShipmentTracking extends Model {
        static associate(models) {
            ShipmentTracking.belongsTo(models.Order, {
                foreignKey: 'order_id',
                as: 'order'
            });
        }
    }
    ShipmentTracking.init({
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        provider_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        tracking_code: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'Pending'
        },
        estimated_delivery_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        last_update_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'ShipmentTracking',
        tableName: 'ShipmentTrackings', // نام جدول در دیتابیس
        timestamps: true
    });
    return ShipmentTracking;
};