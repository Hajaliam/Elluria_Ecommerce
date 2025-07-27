'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. اضافه کردن ستون buy_price به جدول Product
    await queryInterface.addColumn('Products', 'buy_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true, // 👈 می‌تواند null باشد اگر قیمت خرید همیشه موجود نیست
      defaultValue: 0 // 👈 مقدار پیش‌فرض 0
    });

    // 2. ایجاد جدول ProfitLogs برای ثبت سود هر آیتم سفارش
    await queryInterface.createTable('ProfitLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: { // آیدی سفارش مرتبط
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders', // نام جدول Orders (جمع)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر سفارش حذف شد، لاگ سود هم حذف شود
      },
      order_item_id: { // آیدی آیتم سفارش مرتبط (برای جزئیات بیشتر)
        type: Sequelize.INTEGER,
        allowNull: true, // می‌تواند null باشد اگر لاگ کلی سفارش است
        references: {
          model: 'OrderItems', // نام جدول OrderItems (جمع)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر آیتم سفارش حذف شد، لاگ سود هم حذف شود
      },
      product_id: { // آیدی محصول مرتبط (برای تحلیل محصولی)
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products', // نام جدول Products (جمع)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر محصول حذف شد، لاگ سود هم حذف شود
      },
      item_quantity: { // تعداد محصول در این آیتم سفارش
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sell_price_at_purchase: { // قیمت فروش محصول در زمان سفارش
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      buy_price_at_purchase: { // قیمت خرید محصول در زمان سفارش
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      profit_per_item: { // سود هر واحد محصول
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_profit_amount: { // سود کل از این آیتم سفارش
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      transaction_date: { // تاریخ تراکنش/سفارش
        type: Sequelize.DATE,
        allowNull: false
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

  async down (queryInterface, Sequelize) {
    // حذف به ترتیب معکوس ایجاد
    await queryInterface.dropTable('ProfitLogs');
    await queryInterface.removeColumn('Products', 'buy_price');
  }
};