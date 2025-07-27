// src/models/profitlog.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ProfitLog extends Model {
        static associate(models) {
            ProfitLog.belongsTo(models.Order, {
                foreignKey: 'order_id',
                as: 'order'
            });
            ProfitLog.belongsTo(models.OrderItem, {
                foreignKey: 'order_item_id',
                as: 'orderItem'
            });
            ProfitLog.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
        }
    }
    ProfitLog.init({
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        order_item_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        item_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        sell_price_at_purchase: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        buy_price_at_purchase: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        profit_per_item: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total_profit_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        transaction_date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'ProfitLog',
        tableName: 'ProfitLogs', // نام جدول در دیتابیس
        timestamps: true
    });
    return ProfitLog;
};