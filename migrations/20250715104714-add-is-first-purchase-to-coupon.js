'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Coupons', 'is_first_purchase_only', {
      type: Sequelize.BOOLEAN,
      allowNull: false, // 👈 این فیلد الزامی است
      defaultValue: false, // 👈 مقدار پیش‌فرض
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Coupons', 'is_first_purchase_only');
  },
};
