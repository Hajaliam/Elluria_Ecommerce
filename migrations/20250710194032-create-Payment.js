'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, // یک پرداخت برای یک سفارش است
        references: {
          model: 'Orders', // نام جدول Order (جمع شده)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر سفارش حذف شد، پرداخت آن هم حذف شود
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      method: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      refunded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      refund_reason: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments');
  }
};