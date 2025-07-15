'use strict';
const bcrypt = require('bcrypt'); // برای هش کردن پسورد ادمین جدید

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // --- اضافه کردن یک کاربر ادمین (اگر هنوز ندارید یا نیاز به یک ادمین مشخص دارید) ---
    // این بخش را می‌توانید حذف کنید اگر از قبل یک کاربر ادمین دارید و role_id آن را به درستی تنظیم کرده‌اید
    const adminRole = await queryInterface.sequelize.query(
        'SELECT id FROM "Roles" WHERE name = \'admin\';',
        { type: Sequelize.QueryTypes.SELECT }
    );
    const adminRoleId = adminRole[0].id;
    const hashedPasswordAdmin = await bcrypt.hash('admin_password_123', 10); // رمز عبور ادمین تستی

    const existingAdmin = await queryInterface.sequelize.query(
        'SELECT id FROM "Users" WHERE username = \'adminuser\';',
        { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin.length === 0) {
      await queryInterface.bulkInsert('Users', [{
        username: 'adminuser',
        email: 'admin@example.com',
        password: hashedPasswordAdmin,
        first_name: 'Admin',
        last_name: 'User',
        phone_number: '09000000000',
        role_id: adminRoleId,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }
    // -----------------------------------------------------------------------------

    // --- اضافه کردن دسته‌بندی‌ها ---
    const [categories] = await queryInterface.bulkInsert('Categories', [
      { name: 'Electronics', description: 'Smartphones, laptops, and gadgets.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Books', description: 'Fiction, non-fiction, and educational books.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Clothing', description: 'Apparel for men and women.', createdAt: new Date(), updatedAt: new Date() }
    ], { returning: true }); // 'returning: true' برای گرفتن IDهای ایجاد شده

    // دریافت ID دسته‌بندی‌ها
    const electronicsCategory = await queryInterface.sequelize.query(
        'SELECT id FROM "Categories" WHERE name = \'Electronics\';',
        { type: Sequelize.QueryTypes.SELECT }
    );
    const booksCategory = await queryInterface.sequelize.query(
        'SELECT id FROM "Categories" WHERE name = \'Books\';',
        { type: Sequelize.QueryTypes.SELECT }
    );
    const clothingCategory = await queryInterface.sequelize.query(
        'SELECT id FROM "Categories" WHERE name = \'Clothing\';',
        { type: Sequelize.QueryTypes.SELECT }
    );

    const electronicsId = electronicsCategory[0].id;
    const booksId = booksCategory[0].id;
    const clothingId = clothingCategory[0].id;

    // --- اضافه کردن محصولات ---
    await queryInterface.bulkInsert('Products', [
      {
        name: 'Smartphone X',
        description: 'Latest model smartphone with advanced features and camera.',
        price: 799.99,
        stock_quantity: 50,
        image_url: '/uploads/products/default_smartphone.jpg',
        category_id: electronicsId,
        slug: 'smartphone-x',
        views_count: 100,
        sold_count: 5,
        createdAt: new Date(), updatedAt: new Date()
      },
      {
        name: 'Laptop Pro',
        description: 'High-performance laptop for professionals.',
        price: 1299.99,
        stock_quantity: 20,
        image_url: '/uploads/products/default_laptop.jpg',
        category_id: electronicsId,
        slug: 'laptop-pro',
        views_count: 80,
        sold_count: 3,
        createdAt: new Date(), updatedAt: new Date()
      },
      {
        name: 'The Great Novel',
        description: 'A captivating story that will keep you hooked.',
        price: 19.99,
        stock_quantity: 100,
        image_url: '/uploads/products/default_book.jpg',
        category_id: booksId,
        slug: 'the-great-novel',
        views_count: 200,
        sold_count: 15,
        createdAt: new Date(), updatedAt: new Date()
      },
      {
        name: 'T-Shirt Casual',
        description: 'Comfortable cotton t-shirt for everyday wear.',
        price: 25.00,
        stock_quantity: 200,
        image_url: '/uploads/products/default_tshirt.jpg',
        category_id: clothingId,
        slug: 't-shirt-casual',
        views_count: 50,
        sold_count: 10,
        createdAt: new Date(), updatedAt: new Date()
      },
      { // محصول با موجودی کم برای تست گزارش
        name: 'Limited Edition Headphone',
        description: 'Premium headphones with noise cancellation.',
        price: 350.00,
        stock_quantity: 3, // موجودی کم
        image_url: '/uploads/products/default_headphone.jpg',
        category_id: electronicsId,
        slug: 'limited-edition-headphone',
        views_count: 120,
        sold_count: 1,
        createdAt: new Date(), updatedAt: new Date()
      }
    ], {});

  },

  async down (queryInterface, Sequelize) {
    // حذف تمام محصولات و دسته‌بندی‌ها
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', { username: 'adminuser' }, {}); // حذف کاربر ادمین تستی
  }
};