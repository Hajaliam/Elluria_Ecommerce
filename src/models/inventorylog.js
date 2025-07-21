// src/models/inventorylog.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class InventoryLog extends Model {
        static associate(models) {
            InventoryLog.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
            InventoryLog.belongsTo(models.User, {
                foreignKey: 'changed_by_user_id',
                as: 'changer'
            });
            InventoryLog.belongsTo(models.Order, {
                foreignKey: 'order_id',
                as: 'order'
            });
        }
    }
    InventoryLog.init({
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        order_id : {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        change_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        quantity_change: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        new_stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        old_stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        changed_by_user_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'InventoryLog',
        tableName: 'InventoryLogs', // نام جدول در دیتابیس
        timestamps: true
    });
    return InventoryLog;
};