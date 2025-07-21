'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('InventoryLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products', // نام جدول Products (جمع)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // نباید لاگ حذف شود اگر محصول حذف شود (یا به نوعی مدیریت شود)
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Orders', // فرض بر اینکه جدول سفارش‌ها اسمش اینه
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      change_type: { // نوع تغییر (مثلاً 'sale', 'return', 'manual_adjust', 'import')
        type: Sequelize.STRING(50),
        allowNull: false
      },
      quantity_change: { // مقدار تغییر (می‌تواند مثبت یا منفی باشد)
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_stock_quantity: { // موجودی جدید پس از تغییر
        type: Sequelize.INTEGER,
        allowNull: false
      },
      old_stock_quantity: { // موجودی قبل از تغییر
        type: Sequelize.INTEGER,
        allowNull: false
      },
      changed_by_user_id: { // کاربری که تغییر را ایجاد کرده (ادمین، سیستم، مشتری)
        type: Sequelize.INTEGER,
        allowNull: true, // می‌تواند null باشد اگر تغییر خودکار یا از طرف سیستم باشد
        references: {
          model: 'Users', // نام جدول Users (جمع)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // اگر کاربر حذف شد، ID آن در لاگ null شود
      },
      description: { // توضیحات اضافی برای تغییر (مثلاً دلیل تغییر دستی)
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('InventoryLogs');
  }
};