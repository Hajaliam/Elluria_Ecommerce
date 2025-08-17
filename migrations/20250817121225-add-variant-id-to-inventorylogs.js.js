'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('InventoryLogs', 'variant_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: 'product_id' // ستون بعد از product_id اضافه می‌شود
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('InventoryLogs', 'variant_id');
  }
};
