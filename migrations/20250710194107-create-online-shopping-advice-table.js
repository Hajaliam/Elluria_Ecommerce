// migrations/YYYYMMDDHHmmss-create-online-shopping-advice-table.js

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('OnlineShoppingAdvices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: { // 👈 این فیلد را اصلاح می‌کنیم
        type: Sequelize.INTEGER,
        allowNull: true, // 👈 **اینجا را به `true` تغییر دهید!**
        references: {
          model: 'Users', // نام جدول کاربران در دیتابیس (جمع)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // 👈 پیشنهاد: تغییر به `SET NULL` اگر کاربر حذف شد
      },
      session_id: { // 👈 **این فیلد جدید را اضافه کنید!**
        type: Sequelize.STRING(255),
        allowNull: true // برای کاربران لاگین شده، این می‌تواند null باشد
      },
      chat_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      object: {
        type: Sequelize.TEXT,
        allowNull: true // 👈 این را هم به `true` تغییر دهید اگر لازم است
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
    await queryInterface.dropTable('OnlineShoppingAdvices');
  }
};