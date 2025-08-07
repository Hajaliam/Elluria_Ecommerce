'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductVariants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products', // اتصال به جدول محصول مادر
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر محصول مادر حذف شد، متغیرهای آن هم حذف شوند
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true, // می‌تواند null باشد تا از قیمت محصول مادر ارث‌بری کند
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true, // کد انبارداری منحصر به فرد برای هر متغیر
        unique: true
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true, // تصویر مخصوص این متغیر (مثلاً تصویر رژ لب قرمز)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProductVariants');
  }
};