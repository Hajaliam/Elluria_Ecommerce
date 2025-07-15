'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // --- دریافت IDهای پیش‌نیاز ---

    // 1. دریافت ID کاربر 'adminuser'
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE username = 'adminuser';`,
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (users.length === 0) {
      console.warn('Admin user "adminuser" not found. Skipping order seeding.');
      return;
    }
    const userId = users[0].id;

    // 2. دریافت ID آدرس مرتبط با کاربر
    const addresses = await queryInterface.sequelize.query(
      `SELECT id FROM "Addresses" WHERE user_id = ${userId};`,
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (addresses.length === 0) {
      console.warn('Address for admin user not found. Skipping order seeding.');
      return;
    }
    const addressId = addresses[0].id;

    // 3. دریافت ID و قیمت محصولات
    const product1Result = await queryInterface.sequelize.query(
      `SELECT id, price FROM "Products" WHERE slug = 'smartphone-x';`,
      { type: Sequelize.QueryTypes.SELECT },
    );
    const product2Result = await queryInterface.sequelize.query(
      `SELECT id, price FROM "Products" WHERE slug = 'laptop-pro';`,
      { type: Sequelize.QueryTypes.SELECT },
    );
    const product3Result = await queryInterface.sequelize.query(
      `SELECT id, price FROM "Products" WHERE slug = 'limited-edition-headphone';`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (
      product1Result.length === 0 ||
      product2Result.length === 0 ||
      product3Result.length === 0
    ) {
      console.warn(
        'One or more required products not found. Skipping order seeding.',
      );
      return;
    }

    const product1Id = product1Result[0].id;
    const product1Price = product1Result[0].price;
    const product2Id = product2Result[0].id;
    const product2Price = product2Result[0].price;
    const product3Id = product3Result[0].id;
    const product3Price = product3Result[0].price;

    const orderDate1 = new Date();
    orderDate1.setDate(orderDate1.getDate() - 5);

    const orderDate2 = new Date();
    orderDate2.setDate(orderDate2.getDate() - 2);

    // --- سفارش 1 ---
    await queryInterface.bulkInsert('Orders', [
      {
        user_id: userId,
        total_amount: (parseFloat(product1Price) * 1).toFixed(2),
        status: 'delivered',
        shipping_address_id: addressId,
        payment_status: 'paid',
        createdAt: orderDate1,
        updatedAt: orderDate1,
      },
    ]);

    const order1IdResult = await queryInterface.sequelize.query(
      `SELECT id FROM "Orders" WHERE user_id = ${userId} AND status = 'delivered' ORDER BY "createdAt" DESC LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT },
    );
    const order1Id = order1IdResult[0].id;

    await queryInterface.bulkInsert('OrderItems', [
      {
        order_id: order1Id,
        product_id: product1Id,
        quantity: 1,
        price_at_purchase: product1Price,
        createdAt: orderDate1,
        updatedAt: orderDate1,
      },
    ]);

    await queryInterface.bulkInsert('Payments', [
      {
        order_id: order1Id,
        transaction_id: 'TRX-12345-' + Date.now(),
        amount: (parseFloat(product1Price) * 1).toFixed(2),
        method: 'Zarinpal',
        status: 'success',
        payment_date: orderDate1,
        createdAt: orderDate1,
        updatedAt: orderDate1,
      },
    ]);

    // --- سفارش 2 ---
    await queryInterface.bulkInsert('Orders', [
      {
        user_id: userId,
        total_amount: (
          parseFloat(product2Price) * 2 +
          parseFloat(product3Price) * 1
        ).toFixed(2),
        status: 'processing',
        shipping_address_id: addressId,
        payment_status: 'paid',
        createdAt: orderDate2,
        updatedAt: orderDate2,
      },
    ]);

    const order2IdResult = await queryInterface.sequelize.query(
      `SELECT id FROM "Orders" WHERE user_id = ${userId} AND status = 'processing' ORDER BY "createdAt" DESC LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT },
    );
    const order2Id = order2IdResult[0].id;

    await queryInterface.bulkInsert('OrderItems', [
      {
        order_id: order2Id,
        product_id: product2Id,
        quantity: 2,
        price_at_purchase: product2Price,
        createdAt: orderDate2,
        updatedAt: orderDate2,
      },
      {
        order_id: order2Id,
        product_id: product3Id,
        quantity: 1,
        price_at_purchase: product3Price,
        createdAt: orderDate2,
        updatedAt: orderDate2,
      },
    ]);

    await queryInterface.bulkInsert('Payments', [
      {
        order_id: order2Id,
        transaction_id: 'TRX-67890-' + Date.now(),
        amount: (
          parseFloat(product2Price) * 2 +
          parseFloat(product3Price) * 1
        ).toFixed(2),
        method: 'CreditCard',
        status: 'success',
        payment_date: orderDate2,
        createdAt: orderDate2,
        updatedAt: orderDate2,
      },
    ]);

    // --- بروزرسانی موجودی ---
    const currentProductX = await queryInterface.sequelize.query(
      `SELECT id, stock_quantity FROM "Products" WHERE slug = 'smartphone-x';`,
      { type: Sequelize.QueryTypes.SELECT },
    );
    const currentLaptopPro = await queryInterface.sequelize.query(
      `SELECT id, stock_quantity FROM "Products" WHERE slug = 'laptop-pro';`,
      { type: Sequelize.QueryTypes.SELECT },
    );
    const currentHeadphone = await queryInterface.sequelize.query(
      `SELECT id, stock_quantity FROM "Products" WHERE slug = 'limited-edition-headphone';`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (currentProductX.length > 0) {
      await queryInterface.bulkUpdate(
        'Products',
        {
          stock_quantity: currentProductX[0].stock_quantity - 1,
        },
        { id: currentProductX[0].id },
      );
    }

    if (currentLaptopPro.length > 0) {
      await queryInterface.bulkUpdate(
        'Products',
        {
          stock_quantity: currentLaptopPro[0].stock_quantity - 2,
        },
        { id: currentLaptopPro[0].id },
      );
    }

    if (currentHeadphone.length > 0) {
      await queryInterface.bulkUpdate(
        'Products',
        {
          stock_quantity: currentHeadphone[0].stock_quantity - 1,
        },
        { id: currentHeadphone[0].id },
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payments', null, {});
    await queryInterface.bulkDelete('OrderItems', null, {});
    await queryInterface.bulkDelete('Orders', null, {});
    await queryInterface.bulkDelete('Addresses', null, {});
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', { username: 'adminuser' }, {});
  },
};
