'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر کاربر حذف شد، بررسی‌های او هم حذف شوند
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // جلوگیری از حذف محصول اگر بررسی دارد
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
        // Sequelize check constraints can be added directly to the model definition,
        // or as a raw query in a separate migration if needed.
        // For now, we rely on application logic or model validations.
      },
      comment: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add a unique index to ensure one review per user per product (if desired)
    await queryInterface.addConstraint('Reviews', {
      fields: ['user_id', 'product_id'],
      type: 'unique',
      name: 'unique_user_product_review_constraint'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Reviews', 'unique_user_product_review_constraint');
    await queryInterface.dropTable('Reviews');
  }
};