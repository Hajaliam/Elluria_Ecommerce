'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders', // نام جدول Order (جمع شده)
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // اگر سفارش حذف شد، آیتم‌های آن هم حذف شوند
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products', // نام جدول Product (جمع شده)
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // جلوگیری از حذف محصول اگر در سفارش است
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price_at_purchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderItems');
  },
};
