'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // --- اضافه کردن نقش 'customer' ---
    const customerRoleExists = await queryInterface.sequelize.query(
      'SELECT id FROM "Roles" WHERE name = \'customer\';',
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (customerRoleExists.length === 0) {
      await queryInterface.bulkInsert(
        'Roles',
        [
          {
            name: 'customer',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {},
      );
    }

    // --- اضافه کردن نقش 'admin' ---
    const adminRoleExists = await queryInterface.sequelize.query(
      'SELECT id FROM "Roles" WHERE name = \'admin\';',
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (adminRoleExists.length === 0) {
      await queryInterface.bulkInsert(
        'Roles',
        [
          {
            name: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {},
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // حذف فقط نقش‌هایی که توسط این Seeder اضافه شده‌اند
    await queryInterface.bulkDelete(
      'Roles',
      { name: ['customer', 'admin'] },
      {},
    );
  },
};
