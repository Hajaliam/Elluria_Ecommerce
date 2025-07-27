'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. ایجاد جدول ShipmentTracking
    await queryInterface.createTable('ShipmentTrackings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: { // آیدی سفارش مرتبط
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, // هر سفارش فقط یک رکورد ردیابی اصلی دارد
        references: {
          model: 'Orders', // نام جدول Orders (جمع)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // اگر سفارش حذف شد، ردیابی آن هم حذف شود
      },
      provider_name: { // شرکت ارسال کننده (مثلاً 'Post', 'Tipax')
        type: Sequelize.STRING(100),
        allowNull: false
      },
      tracking_code: { // کد رهگیری مرسوله
        type: Sequelize.STRING(255),
        allowNull: true, // می‌تواند در ابتدا null باشد اگر کد رهگیری هنوز ثبت نشده
        unique: true // کد رهگیری باید منحصر به فرد باشد
      },
      status: { // وضعیت فعلی مرسوله (مثلاً 'Pending', 'In Transit', 'Delivered', 'Failed')
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Pending'
      },
      estimated_delivery_date: { // تاریخ تخمینی تحویل (اختیاری)
        type: Sequelize.DATE,
        allowNull: true
      },
      last_update_date: { // تاریخ آخرین به‌روزرسانی وضعیت
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
    await queryInterface.dropTable('ShipmentTrackings');
  }
};