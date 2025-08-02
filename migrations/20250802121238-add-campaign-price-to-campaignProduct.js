'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CampaignProducts', 'campaign_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'قیمت ویژه محصول در کمپین (اختیاری)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('CampaignProducts', 'campaign_price');
  }
};
