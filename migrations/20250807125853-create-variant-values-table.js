'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VariantValues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      variant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProductVariants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      attribute_value_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'AttributeValues',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Constraint برای جلوگیری از ثبت زوج تکراری (variant_id, attribute_value_id)
    await queryInterface.addConstraint('VariantValues', {
      fields: ['variant_id', 'attribute_value_id'],
      type: 'unique',
      name: 'unique_variant_attribute_value_constraint'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('VariantValues', 'unique_variant_attribute_value_constraint');
    await queryInterface.dropTable('VariantValues');
  }
};