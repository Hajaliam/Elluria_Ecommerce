'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const user = await queryInterface.sequelize.query(
        'SELECT id FROM "Users" WHERE username = \'adminuser\';', // یا هر کاربر دیگری که می‌خواهید آدرس برایش بسازید
        { type: Sequelize.QueryTypes.SELECT }
    );
    const userId = user[0].id;

    await queryInterface.bulkInsert('Addresses', [{
      user_id: userId,
      street: '123 Test Street',
      city: 'Tehran',
      state: 'Tehran',
      zip_code: '12345',
      country: 'Iran',
      is_default: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Addresses', null, {});
  }
};