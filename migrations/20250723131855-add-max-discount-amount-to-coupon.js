'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. اضافه کردن ستون max_discount_amount به جدول Coupons
    await queryInterface.addColumn('Coupons', 'max_discount_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true, // 👈 می‌تواند null باشد اگر حداکثر تخفیف ندارد
      defaultValue: null // 👈 مقدار پیش‌فرض null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Coupons', 'max_discount_amount');
  }
};