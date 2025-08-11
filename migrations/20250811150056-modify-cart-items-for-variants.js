'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // ابتدا تمام آیتم‌های موجود در سبد خرید را حذف می‌کنیم چون ساختار تغییر می‌کند
      await queryInterface.bulkDelete('CartItems', null, { transaction });

      // اضافه کردن ستون جدید variant_id
      await queryInterface.addColumn('CartItems', 'variant_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProductVariants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر متغیری حذف شد، از سبد خرید هم حذف شود
      }, { transaction });

      // حذف ستون قدیمی product_id
      await queryInterface.removeColumn('CartItems', 'product_id', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('CartItems', 'product_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      await queryInterface.removeColumn('CartItems', 'variant_id', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};