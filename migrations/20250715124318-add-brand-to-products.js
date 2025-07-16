'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. ایجاد جدول Brand
    await queryInterface.createTable('Brands', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 2. اضافه کردن ستون brand_id به جدول Product
    await queryInterface.addColumn('Products', 'brand_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // 👈 می‌تواند null باشد
      references: {
        model: 'Brands',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // اگر یک برند حذف شد، محصولات آن بدون برند باقی بمانند
    });
  },

  async down(queryInterface, Sequelize) {
    // حذف ستون brand_id از جدول Product
    await queryInterface.removeColumn('Products', 'brand_id');

    // حذف جدول Brand
    await queryInterface.dropTable('Brands');
  },
};
