'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderHistories', {
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
        onDelete: 'CASCADE', // اگر سفارش حذف شد، تاریخچه آن هم حذف شود
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      changed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      changed_by: {
        type: Sequelize.INTEGER,
        allowNull: true, // می‌تواند null باشد اگر تغییر توسط سیستم باشد
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // اگر کاربری که تغییر داده حذف شد، این فیلد به null تبدیل شود
      },
      createdAt: {
        // اضافه شدن برای استانداردسازی
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        // اضافه شدن برای استانداردسازی
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderHistories');
  },
};
