'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CouponBrands', {
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
          model: 'Coupons', // نام جدول کوپن‌ها
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر کوپن حذف شد، این رکورد هم حذف شود
      },
      brand_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Brands', // نام جدول برندها
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر برند حذف شد، این رکورد هم حذف شود
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

    // اضافه کردن یک constraint برای جلوگیری از ثبت زوج (coupon_id, brand_id) تکراری
    await queryInterface.addConstraint('CouponBrands', {
      fields: ['coupon_id', 'brand_id'],
      type: 'unique',
      name: 'unique_coupon_brand_constraint'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('CouponBrands', 'unique_coupon_brand_constraint');
    await queryInterface.dropTable('CouponBrands');
  }
};