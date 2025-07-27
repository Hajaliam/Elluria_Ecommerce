'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. ایجاد جدول Campaign
    await queryInterface.createTable('Campaigns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: { // 👈 عنوان کمپین [cite: 69]
        type: Sequelize.STRING,
        allowNull: false
      },
      description: { // 👈 توضیح کمپین [cite: 69]
        type: Sequelize.TEXT,
        allowNull: true
      },
      slug: { // 👈 slug کمپین [cite: 69]
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      banner_image_url: { // 👈 عکس بنر [cite: 70]
        type: Sequelize.STRING,
        allowNull: true
      },
      campaign_type: { // 👈 campaign_type (مثل today_offer، seasonal، clearance، bestsellers و ...) [cite: 71]
        type: Sequelize.STRING(50),
        allowNull: false
      },
      start_date: { // 👈 تاریخ شروع کمپین [cite: 72]
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: { // 👈 تاریخ پایان کمپین [cite: 72]
        type: Sequelize.DATE,
        allowNull: false
      },
      show_countdown: { // 👈 نمایش تایمر معکوس (boolean) [cite: 73]
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      priority: { // 👈 اولویت نمایش [cite: 74]
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      cta_link: { // 👈 لینک CTA [cite: 75]
        type: Sequelize.STRING,
        allowNull: true
      },
      is_active: { // 👈 وضعیت فعال بودن کمپین [cite: 76]
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // 2. ایجاد جدول CampaignProduct برای ارتباط Many-to-Many بین Campaigns و Products
    await queryInterface.createTable('CampaignProducts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Campaigns',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر کمپین حذف شد، ارتباط آن با محصول حذف شود
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر محصول حذف شد، ارتباط آن با کمپین حذف شود
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
    // اضافه کردن Unique Constraint برای اطمینان از عدم تکرار (campaign_id, product_id)
    await queryInterface.addConstraint('CampaignProducts', {
      fields: ['campaign_id', 'product_id'],
      type: 'unique',
      name: 'unique_campaign_product_constraint'
    });

    // 3. اضافه کردن ستون campaign_id به جدول Product (اگر هنوز اضافه نشده)
    // این ممکن است قبلاً به عنوان بخشی از کوپن اضافه شده باشد، اما برای اطمینان مجدداً اضافه می‌کنیم
    // (اگر از قبل موجود باشد، Sequelize آن را رد می‌کند.)
    const tableInfo = await queryInterface.describeTable('Products');
    if (!tableInfo.campaign_id) { // فقط در صورتی اضافه کن که قبلاً وجود ندارد
      await queryInterface.addColumn('Products', 'campaign_id', {
        type: Sequelize.INTEGER,
        allowNull: true, // می‌تواند null باشد اگر محصولی در کمپین نباشد
        references: {
          model: 'Campaigns', // نام جدول Campaigns (جمع)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // اگر یک کمپین حذف شد، محصولات آن از کمپین خارج شوند
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // حذف به ترتیب معکوس ایجاد
    await queryInterface.removeConstraint('CampaignProducts', 'unique_campaign_product_constraint');
    await queryInterface.dropTable('CampaignProducts');

    // اگر ستون campaign_id در این Migration اضافه شده بود (یعنی قبلاً وجود نداشت)، آن را حذف کن
    const tableInfo = await queryInterface.describeTable('Products');
    if (tableInfo.campaign_id) { // فقط در صورتی حذف کن که وجود دارد
      await queryInterface.removeColumn('Products', 'campaign_id');
    }

    await queryInterface.dropTable('Campaigns');
  }
};