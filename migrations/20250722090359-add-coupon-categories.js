'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. ایجاد جدول CouponCategories برای ارتباط Many-to-Many بین Coupons و Categories
    await queryInterface.createTable('CouponCategories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      coupon_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Coupons', // نام جدول Coupons (جمع)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر کوپن حذف شد، ارتباط آن با دسته‌بندی حذف شود
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories', // نام جدول Categories (جمع)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر دسته‌بندی حذف شد، ارتباط آن با کوپن حذف شود
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    // اضافه کردن Unique Constraint برای اطمینان از عدم تکرار (coupon_id, category_id)
    await queryInterface.addConstraint('CouponCategories', {
      fields: ['coupon_id', 'category_id'],
      type: 'unique',
      name: 'unique_coupon_category_constraint'
    });
  },

  async down (queryInterface, Sequelize) {
    // حذف به ترتیب معکوس ایجاد
    await queryInterface.removeConstraint('CouponCategories', 'unique_coupon_category_constraint');
    await queryInterface.dropTable('CouponCategories');
  }
};