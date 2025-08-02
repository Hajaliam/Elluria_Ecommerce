'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CampaignProducts', 'original_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'قیمت اصلی محصول هنگام اضافه شدن به کمپین'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('CampaignProducts', 'original_price');
  }
};
