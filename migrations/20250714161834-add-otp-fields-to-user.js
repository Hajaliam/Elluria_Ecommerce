'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'otp_code', {
      type: Sequelize.STRING(6), // مثلاً 6 رقم
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'otp_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'otp_code');
    await queryInterface.removeColumn('Users', 'otp_expires_at');
  },
};
