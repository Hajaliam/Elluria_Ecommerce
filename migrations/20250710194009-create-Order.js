'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', { // نام جدول Order (جمع شده)
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // جلوگیری از حذف کاربر اگر سفارش فعال دارد
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      shipping_address_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Addresses', // نام جدول Address (جمع شده)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // جلوگیری از حذف آدرس اگر سفارشی به آن ارجاع می‌دهد
      },
      payment_status: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      coupon_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // می‌تواند null باشد اگر کوپن استفاده نشده باشد
        references: {
          model: 'Coupons', // نام جدول Coupon (جمع شده)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // اگر کوپن حذف شد، این فیلد به null تبدیل شود
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
    await queryInterface.dropTable('Orders');
  }
};