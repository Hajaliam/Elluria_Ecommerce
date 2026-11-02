'use strict';

const assert = require('node:assert/strict');

async function resetApplicationTables(db) {
  const [identity] = await db.sequelize.query(
    'SELECT current_database() AS database, current_user AS username',
  );
  assert.deepEqual(identity[0], {
    database: 'elluria_test',
    username: 'elluria_test_user',
  });

  const [rows] = await db.sequelize.query(
    `SELECT tablename
       FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename <> 'SequelizeMeta'
      ORDER BY tablename`,
  );
  if (rows.length === 0) return;
  const quotedTables = rows
    .map(({ tablename }) => `"${String(tablename).replaceAll('"', '""')}"`)
    .join(', ');
  await db.sequelize.query(`TRUNCATE TABLE ${quotedTables} RESTART IDENTITY CASCADE`);
}

async function createUser(db, role, suffix) {
  return db.User.create({
    username: `pv-user-${suffix}`,
    email: `pv-user-${suffix}@example.test`,
    password: 'not-a-real-login-secret',
    first_name: 'Payment',
    last_name: `Variant-${suffix}`,
    role_id: role.id,
  });
}

function moneyToCents(value) {
  const match = String(value).match(/^(\d+)(?:\.(\d{1,2}))?$/);
  assert.ok(match, `Fixture money must be a non-negative decimal with at most two places: ${value}`);
  return (BigInt(match[1]) * 100n) + BigInt((match[2] || '').padEnd(2, '0'));
}

function centsToMoney(value) {
  return `${value / 100n}.${String(value % 100n).padStart(2, '0')}`;
}

async function createPaymentVariantFixture(db, options = {}) {
  const {
    variantPrice = '125.00',
    productPrice = '100.00',
    productStock = 777,
    variantStock = 8,
    quantity = 2,
    includeCart = false,
    includeOrder = true,
    includePendingPayment = false,
    suffix = 'primary',
  } = options;

  let role = await db.Role.findOne({ where: { name: 'customer' } });
  if (!role) role = await db.Role.create({ name: 'customer' });
  const user = await createUser(db, role, suffix);
  const address = await db.Address.create({
    user_id: user.id,
    street: 'Test Street 1',
    city: 'Tehran',
    state: 'Tehran',
    zip_code: '1111111111',
    country: 'IR',
    is_default: true,
  });
  const category = await db.Category.create({
    name: `PV Category ${suffix}`,
    description: 'Regression fixture only',
  });
  const product = await db.Product.create({
    name: `PV Product ${suffix}`,
    description: 'Regression fixture only',
    price: productPrice,
    stock_quantity: productStock,
    category_id: category.id,
    slug: `pv-product-${suffix}`,
    buy_price: '40.00',
  });
  const variant = await db.ProductVariant.create({
    product_id: product.id,
    price: variantPrice,
    stock_quantity: variantStock,
    sku: `PV-SKU-${suffix}`,
  });

  let cart = null;
  let cartItem = null;
  if (includeCart) {
    cart = await db.Cart.create({
      user_id: user.id,
      session_id: null,
      expires_at: new Date('2030-01-01T00:00:00.000Z'),
    });
    cartItem = await db.CartItem.create({
      cart_id: cart.id,
      variant_id: variant.id,
      quantity,
    });
  }

  let order = null;
  let orderItem = null;
  let payment = null;
  if (includeOrder) {
    const effectivePrice = variantPrice === null ? productPrice : variantPrice;
    const orderAmount = centsToMoney(moneyToCents(effectivePrice) * BigInt(quantity));
    order = await db.Order.create({
      user_id: user.id,
      total_amount: orderAmount,
      status: 'pending',
      shipping_address_id: address.id,
      payment_status: 'pending_payment_gateway',
      coupon_id: null,
    });
    orderItem = await db.OrderItem.create({
      order_id: order.id,
      variant_id: variant.id,
      quantity,
      price_at_purchase: effectivePrice,
    });
    if (includePendingPayment) {
      payment = await db.Payment.create({
        order_id: order.id,
        transaction_id: `PV-AUTH-${order.id}-${suffix}`,
        amount: orderAmount,
        method: 'FakePayment',
        status: 'pending',
        payment_date: new Date('2026-11-02T12:00:00.000Z'),
        refunded: false,
      });
    }
  }

  return {
    role,
    user,
    address,
    category,
    product,
    variant,
    cart,
    cartItem,
    order,
    orderItem,
    payment,
    quantity,
  };
}

module.exports = { createPaymentVariantFixture, resetApplicationTables };
