'use strict';

const path = require('node:path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '..', '.env.test'),
  override: true,
  quiet: true,
});

const assert = require('node:assert/strict');
const { after, before, beforeEach, test } = require('node:test');
const { assertDisposableTestDatabase } = require('../../scripts/test-db-guard');
const { createApplication } = require('../../src/app');
const orderService = require('../../src/services/orderService');
const { createFakeAdapters } = require('../support/fake-adapters');
const { disableFileLogging } = require('../support/disable-file-logging');
const {
  createPaymentVariantFixture,
  resetApplicationTables,
} = require('../support/payment-variant-fixtures');

assertDisposableTestDatabase(process.env);
disableFileLogging();
const db = require('../../models');
const fake = createFakeAdapters();
const runtime = createApplication({ adapters: fake.adapters, database: db });
let baseUrl;

async function callback(query) {
  const url = new URL('/api/payments/verify', baseUrl);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  return fetch(url);
}

function paymentCalls() {
  return fake.calls.filter(({ method }) => method.startsWith('payment.'));
}

async function settle(promise) {
  try {
    return { value: await promise, error: null };
  } catch (error) {
    return { value: null, error };
  }
}

before(async () => {
  await db.sequelize.authenticate();
  await new Promise((resolve, reject) => {
    runtime.server.once('error', reject);
    runtime.server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${runtime.server.address().port}`;
});

beforeEach(async () => {
  fake.calls.length = 0;
  fake.adapters.payment.verify.respondWith({ verified: true, referenceId: 'REF-TEST' });
  await resetApplicationTables(db);
});

after(async () => {
  await runtime.close();
  await db.sequelize.close();
});

test('PV-PAY-001 unknown Authority is rejected before provider verification', async () => {
  const fixture = await createPaymentVariantFixture(db, { includePendingPayment: true });

  const response = await callback({
    Authority: 'FORGED-AUTHORITY',
    Status: 'OK',
    orderId: fixture.order.id,
  });

  assert.equal(response.status, 400);
  assert.equal(paymentCalls().length, 0, 'an unknown Authority must be rejected before verification');
  await Promise.all([fixture.order.reload(), fixture.payment.reload()]);
  assert.equal(fixture.payment.status, 'pending');
  assert.equal(fixture.order.payment_status, 'pending_payment_gateway');
  assert.equal(fixture.order.status, 'pending');
  assert.equal(await db.Payment.count(), 1);
  assert.equal(await db.InventoryLog.count({ where: { change_type: 'sold' } }), 0);
  assert.equal(await db.OrderHistory.count({ where: { status: 'paid' } }), 0);
});

test('PV-PAY-002 failed provider verification has no successful side effects', async () => {
  const fixture = await createPaymentVariantFixture(db, { includePendingPayment: true });
  fake.adapters.payment.verify.respondWith({ verified: false });

  const response = await callback({
    Authority: fixture.payment.transaction_id,
    Status: 'OK',
    orderId: fixture.order.id,
  });

  assert.equal(paymentCalls().length, 1, 'provider verification must not be bypassed');
  assert.equal(response.status, 400);
  await Promise.all([fixture.order.reload(), fixture.payment.reload()]);
  assert.equal(fixture.payment.status, 'pending');
  assert.equal(fixture.order.payment_status, 'pending_payment_gateway');
  assert.equal(fixture.order.status, 'pending');
  assert.equal(await db.Payment.count({ where: { order_id: fixture.order.id } }), 1);
  assert.equal(await db.InventoryLog.count({ where: { change_type: 'sold' } }), 0);
  assert.equal(await db.OrderHistory.count({ where: { status: 'paid' } }), 0);
});

test('PV-PAY-003 authority bound to another order cannot finalize the target order', async () => {
  const owner = await createPaymentVariantFixture(db, {
    includePendingPayment: true,
    suffix: 'authority-owner',
  });
  const target = await createPaymentVariantFixture(db, {
    includePendingPayment: true,
    suffix: 'authority-target',
  });

  const response = await callback({
    Authority: owner.payment.transaction_id,
    Status: 'OK',
    orderId: target.order.id,
  });

  assert.equal(response.status, 400);
  assert.equal(paymentCalls().length, 0, 'mismatched Authority must be rejected before verification');
  await Promise.all([
    owner.order.reload(),
    owner.payment.reload(),
    target.order.reload(),
    target.payment.reload(),
  ]);
  assert.equal(owner.payment.status, 'pending');
  assert.equal(owner.order.payment_status, 'pending_payment_gateway');
  assert.equal(owner.order.status, 'pending');
  assert.equal(target.payment.status, 'pending');
  assert.equal(target.order.payment_status, 'pending_payment_gateway');
  assert.equal(target.order.status, 'pending');
  assert.equal(await db.Payment.count(), 2);
  assert.equal(await db.InventoryLog.count({ where: { change_type: 'sold' } }), 0);
  assert.equal(await db.OrderHistory.count({ where: { status: 'paid' } }), 0);
});

test('PV-PAY-004 callback amount cannot replace the server-side order amount', async () => {
  const fixture = await createPaymentVariantFixture(db, { includePendingPayment: true });
  const pendingPaymentId = fixture.payment.id;
  const authority = fixture.payment.transaction_id;

  const response = await callback({
    Authority: authority,
    Status: 'OK',
    orderId: fixture.order.id,
    amount: '1.00',
  });

  assert.equal(paymentCalls().length, 1);
  assert.equal(paymentCalls()[0].args[0].amount, fixture.order.total_amount);
  assert.equal(response.status, 200);
  await fixture.payment.reload();
  assert.equal(fixture.payment.id, pendingPaymentId);
  assert.equal(fixture.payment.transaction_id, authority);
  assert.equal(fixture.payment.amount, fixture.order.total_amount);
  assert.equal(fixture.payment.status, 'success');
  assert.equal(await db.Payment.count({ where: { order_id: fixture.order.id } }), 1);
});

test('PV-PAY-005 verified callback finalizes from immutable OrderItems', async () => {
  const fixture = await createPaymentVariantFixture(db, { includePendingPayment: true });
  const stockBefore = fixture.variant.stock_quantity;
  const originalCartFindOne = db.Cart.findOne;
  db.Cart.findOne = async () => {
    throw new Error('PV-PAY-005 callback must not read Cart during finalization');
  };
  let response;
  try {
    response = await callback({
      Authority: fixture.payment.transaction_id,
      Status: 'OK',
      orderId: fixture.order.id,
    });
  } finally {
    db.Cart.findOne = originalCartFindOne;
  }

  assert.equal(response.status, 200);
  await Promise.all([fixture.order.reload(), fixture.payment.reload(), fixture.variant.reload()]);
  assert.equal(paymentCalls().length, 1);
  assert.equal(fixture.order.payment_status, 'paid');
  assert.equal(fixture.order.status, 'processing');
  assert.equal(fixture.payment.status, 'success');
  assert.equal(fixture.variant.stock_quantity, stockBefore);
  assert.equal(await db.Payment.count({ where: { order_id: fixture.order.id } }), 1);
  const persistedItems = await db.OrderItem.findAll({ where: { order_id: fixture.order.id } });
  assert.equal(persistedItems.length, 1);
  assert.equal(persistedItems[0].id, fixture.orderItem.id, 'the immutable OrderItem must be reused');
});

test('PV-PAY-006 repeated verified callback is idempotent', async () => {
  const fixture = await createPaymentVariantFixture(db, { includePendingPayment: true });
  const stockBefore = fixture.variant.stock_quantity;
  const query = {
    Authority: fixture.payment.transaction_id,
    Status: 'OK',
    orderId: fixture.order.id,
  };

  const first = await callback(query);
  const second = await callback(query);

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(paymentCalls().length, 1, 'an already-finalized retry must not re-verify');
  assert.equal(await db.Payment.count({ where: { order_id: fixture.order.id } }), 1);
  const persistedItems = await db.OrderItem.findAll({ where: { order_id: fixture.order.id } });
  assert.equal(persistedItems.length, 1);
  assert.equal(persistedItems[0].id, fixture.orderItem.id);
  assert.equal(await db.OrderHistory.count({ where: { order_id: fixture.order.id, status: 'paid' } }), 1);
  await fixture.variant.reload();
  assert.equal(fixture.variant.stock_quantity, stockBefore);
});

test('PV-PAY-007 OrderItem snapshots an independent Variant price', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includeCart: true,
    includeOrder: false,
    variantPrice: '125.00',
    productPrice: '100.00',
    suffix: 'variant-price',
  });

  const result = await settle(orderService.placeOrder(fixture.user.id, {
    shippingAddressId: fixture.address.id,
  }));
  assert.ifError(result.error);
  const order = result.value;
  const item = await db.OrderItem.findOne({ where: { order_id: order.id } });

  assert.equal(item.price_at_purchase, '125.00');
  assert.equal(item.variant_id, fixture.variant.id);
});

test('PV-PAY-008 OrderItem falls back to Product.price only when Variant.price is null', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includeCart: true,
    includeOrder: false,
    variantPrice: null,
    productPrice: '100.00',
    suffix: 'fallback-price',
  });

  const result = await settle(orderService.placeOrder(fixture.user.id, {
    shippingAddressId: fixture.address.id,
  }));
  assert.ifError(result.error);
  const order = result.value;
  const item = await db.OrderItem.findOne({ where: { order_id: order.id } });

  assert.equal(item.price_at_purchase, '100.00');
});

test('PV-PAY-009 persisted OrderItem identifies the sellable unit by variant_id', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includeCart: true,
    includeOrder: false,
    suffix: 'variant-identity',
  });

  const result = await settle(orderService.placeOrder(fixture.user.id, {
    shippingAddressId: fixture.address.id,
  }));
  assert.ifError(result.error);
  const order = result.value;
  const item = await db.OrderItem.findOne({ where: { order_id: order.id }, raw: true });

  assert.equal(item.variant_id, fixture.variant.id);
  assert.equal(Object.hasOwn(item, 'product_id'), false);
});

test('PV-PAY-010 order reservation decrements exactly ProductVariant.stock_quantity', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includeCart: true,
    includeOrder: false,
    variantStock: 8,
    quantity: 2,
    suffix: 'variant-stock',
  });
  await db.CartItem.create({
    cart_id: fixture.cart.id,
    variant_id: fixture.variant.id,
    quantity: 3,
  });

  const result = await settle(
    orderService.placeOrder(fixture.user.id, { shippingAddressId: fixture.address.id }),
  );
  assert.ifError(result.error);
  await fixture.variant.reload();

  assert.equal(fixture.variant.stock_quantity, 3);
  const orderItems = await db.OrderItem.findAll({ where: { order_id: result.value.id } });
  assert.equal(orderItems.length, 1, 'duplicate cart rows must become one Variant order line');
  assert.equal(orderItems[0].quantity, 5);
  const log = await db.InventoryLog.findOne({ where: { variant_id: fixture.variant.id } });
  assert.equal(log.quantity_change, -5);
  assert.equal(log.old_stock_quantity, 8);
  assert.equal(log.new_stock_quantity, 3);
});

test('PV-PAY-011 order reservation neither reads nor decrements legacy Product.stock_quantity', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includeCart: true,
    includeOrder: false,
    productStock: 0,
    variantStock: 8,
    quantity: 2,
    suffix: 'product-stock',
  });

  const result = await settle(
    orderService.placeOrder(fixture.user.id, { shippingAddressId: fixture.address.id }),
  );
  assert.ifError(result.error);
  await Promise.all([fixture.product.reload(), fixture.variant.reload()]);

  assert.equal(fixture.product.stock_quantity, 0);
  assert.equal(fixture.variant.stock_quantity, 6);
});

test('PV-PAY-012 insufficient Variant stock cannot create a partially finalized order', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includeCart: true,
    includeOrder: false,
    variantStock: 1,
    quantity: 2,
    suffix: 'insufficient-stock',
  });

  await assert.rejects(
    orderService.placeOrder(fixture.user.id, { shippingAddressId: fixture.address.id }),
    /Insufficient stock/,
  );
  await fixture.variant.reload();

  assert.equal(fixture.variant.stock_quantity, 1);
  assert.equal(await db.Order.count(), 0);
  assert.equal(await db.OrderItem.count(), 0);
  assert.equal(await db.InventoryLog.count(), 0);
  assert.equal(await db.CartItem.count({ where: { cart_id: fixture.cart.id } }), 1);
});

test('PV-PAY-013 placeOrder rolls back every finalization write after cart cleanup', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includeCart: true,
    includeOrder: false,
    variantStock: 8,
    quantity: 2,
    suffix: 'rollback',
  });
  const originalExpiry = fixture.cart.expires_at.getTime();
  const variantStockBefore = fixture.variant.stock_quantity;
  const productStockBefore = fixture.product.stock_quantity;
  const originalClearCart = orderService.cartService.clearCart;
  orderService.cartService.clearCart = async function clearCartThenFail(...args) {
    await originalClearCart.apply(this, args);
    throw new Error('PV-PAY-013 controlled failure after clearCart');
  };
  try {
    await assert.rejects(
      orderService.placeOrder(fixture.user.id, { shippingAddressId: fixture.address.id }),
      /PV-PAY-013 controlled failure after clearCart/,
    );
  } finally {
    orderService.cartService.clearCart = originalClearCart;
  }

  assert.equal(await db.Order.count(), 0);
  assert.equal(await db.OrderItem.count(), 0);
  assert.equal(await db.InventoryLog.count(), 0);
  await Promise.all([fixture.variant.reload(), fixture.product.reload(), fixture.cart.reload()]);
  assert.equal(fixture.variant.stock_quantity, variantStockBefore);
  assert.equal(
    await db.CartItem.count({ where: { cart_id: fixture.cart.id } }),
    1,
    'rolling back the caller transaction must restore cart items',
  );
  assert.equal(fixture.cart.expires_at.getTime(), originalExpiry);
  assert.equal(fixture.product.stock_quantity, productStockBefore);
});

test('PV-PAY-014 non-OK callback creates no paid state, sold log, or payment', async () => {
  const fixture = await createPaymentVariantFixture(db);

  const response = await callback({
    Authority: 'AUTH-CANCELLED',
    Status: 'NOK',
    orderId: fixture.order.id,
  });

  assert.equal(response.status, 400);
  await fixture.order.reload();
  assert.equal(fixture.order.payment_status, 'pending_payment_gateway');
  assert.equal(await db.Payment.count(), 0);
  assert.equal(await db.InventoryLog.count({ where: { change_type: 'sold' } }), 0);
  assert.equal(await db.OrderHistory.count({ where: { status: 'paid' } }), 0);
});

test('PV-PAY-015 zero Variant price remains zero without Product price fallback', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includeCart: true,
    includeOrder: false,
    variantPrice: '0.00',
    productPrice: '100.00',
    quantity: 2,
    suffix: 'zero-price',
  });

  const result = await settle(
    orderService.placeOrder(fixture.user.id, { shippingAddressId: fixture.address.id }),
  );
  assert.ifError(result.error);
  const item = await db.OrderItem.findOne({ where: { order_id: result.value.id } });

  assert.equal(item.price_at_purchase, '0.00');
  assert.equal(result.value.total_amount, '5.00', 'only the default shipping charge should remain');
});

test('PV-PAY-016 concurrent verified callbacks finalize exactly once', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includePendingPayment: true,
    suffix: 'concurrent-callback',
  });
  const variantStockBefore = fixture.variant.stock_quantity;
  const productStockBefore = fixture.product.stock_quantity;
  const query = {
    Authority: fixture.payment.transaction_id,
    Status: 'OK',
    orderId: fixture.order.id,
  };

  const [first, second] = await Promise.all([callback(query), callback(query)]);

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  const verifyCount = paymentCalls().filter(({ method }) => method === 'payment.verify').length;
  assert.ok(verifyCount === 1 || verifyCount === 2, `expected one or two verifies, got ${verifyCount}`);
  assert.equal(await db.Payment.count({ where: { order_id: fixture.order.id } }), 1);
  assert.equal(
    await db.OrderHistory.count({ where: { order_id: fixture.order.id, status: 'paid' } }),
    1,
  );
  const persistedItems = await db.OrderItem.findAll({ where: { order_id: fixture.order.id } });
  assert.equal(persistedItems.length, 1);
  assert.equal(persistedItems[0].id, fixture.orderItem.id);
  await Promise.all([
    fixture.order.reload(),
    fixture.payment.reload(),
    fixture.variant.reload(),
    fixture.product.reload(),
  ]);
  assert.equal(fixture.payment.status, 'success');
  assert.equal(fixture.order.payment_status, 'paid');
  assert.equal(fixture.order.status, 'processing');
  assert.equal(fixture.variant.stock_quantity, variantStockBefore);
  assert.equal(fixture.product.stock_quantity, productStockBefore);
});

test('PV-PAY-017 finalization failure rolls back and a retry can complete', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includePendingPayment: true,
    suffix: 'callback-rollback',
  });
  const variantStockBefore = fixture.variant.stock_quantity;
  const productStockBefore = fixture.product.stock_quantity;
  const originalHistoryCreate = db.OrderHistory.create;
  db.OrderHistory.create = async () => {
    throw new Error('PV-PAY-017 controlled failure after finalization writes');
  };

  let failedResponse;
  try {
    failedResponse = await callback({
      Authority: fixture.payment.transaction_id,
      Status: 'OK',
      orderId: fixture.order.id,
    });
  } finally {
    db.OrderHistory.create = originalHistoryCreate;
  }

  assert.equal(failedResponse.status, 500);
  await Promise.all([
    fixture.order.reload(),
    fixture.payment.reload(),
    fixture.variant.reload(),
    fixture.product.reload(),
  ]);
  assert.equal(fixture.payment.status, 'pending');
  assert.equal(fixture.order.payment_status, 'pending_payment_gateway');
  assert.equal(fixture.order.status, 'pending');
  assert.equal(await db.OrderHistory.count({ where: { order_id: fixture.order.id, status: 'paid' } }), 0);
  const itemsAfterRollback = await db.OrderItem.findAll({ where: { order_id: fixture.order.id } });
  assert.equal(itemsAfterRollback.length, 1);
  assert.equal(itemsAfterRollback[0].id, fixture.orderItem.id);
  assert.equal(fixture.variant.stock_quantity, variantStockBefore);
  assert.equal(fixture.product.stock_quantity, productStockBefore);

  const retry = await callback({
    Authority: fixture.payment.transaction_id,
    Status: 'OK',
    orderId: fixture.order.id,
  });

  assert.equal(retry.status, 200);
  assert.equal(paymentCalls().filter(({ method }) => method === 'payment.verify').length, 2);
  await Promise.all([fixture.order.reload(), fixture.payment.reload(), fixture.variant.reload()]);
  assert.equal(fixture.payment.status, 'success');
  assert.equal(fixture.order.payment_status, 'paid');
  assert.equal(fixture.order.status, 'processing');
  assert.equal(await db.Payment.count({ where: { order_id: fixture.order.id } }), 1);
  assert.equal(await db.OrderHistory.count({ where: { order_id: fixture.order.id, status: 'paid' } }), 1);
  assert.equal(await db.OrderItem.count({ where: { order_id: fixture.order.id } }), 1);
  assert.equal(fixture.variant.stock_quantity, variantStockBefore);
});

test('PV-PAY-018 provider error fails closed without exposing or mutating state, then retry succeeds', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includePendingPayment: true,
    suffix: 'provider-error',
  });
  const sensitiveAdapterMessage = 'PV-PAY-018-SENSITIVE-ADAPTER-DETAIL';
  const productStockBefore = fixture.product.stock_quantity;
  const variantStockBefore = fixture.variant.stock_quantity;
  const orderItemBefore = await db.OrderItem.findByPk(fixture.orderItem.id, { raw: true });
  fake.adapters.payment.verify.failWith(new Error(sensitiveAdapterMessage));

  const failedResponse = await callback({
    Authority: fixture.payment.transaction_id,
    Status: 'OK',
    orderId: fixture.order.id,
  });
  const failedBody = await failedResponse.text();

  assert.equal(failedResponse.status, 502);
  assert.equal(failedBody.includes(sensitiveAdapterMessage), false);
  assert.equal(paymentCalls().filter(({ method }) => method === 'payment.verify').length, 1);
  await Promise.all([
    fixture.payment.reload(),
    fixture.order.reload(),
    fixture.product.reload(),
    fixture.variant.reload(),
  ]);
  assert.equal(fixture.payment.status, 'pending');
  assert.equal(fixture.order.status, 'pending');
  assert.equal(fixture.order.payment_status, 'pending_payment_gateway');
  assert.equal(
    await db.OrderHistory.count({ where: { order_id: fixture.order.id, status: 'paid' } }),
    0,
  );
  assert.equal(fixture.product.stock_quantity, productStockBefore);
  assert.equal(fixture.variant.stock_quantity, variantStockBefore);
  assert.deepEqual(
    await db.OrderItem.findByPk(fixture.orderItem.id, { raw: true }),
    orderItemBefore,
  );

  fake.adapters.payment.verify.respondWith({ verified: true, referenceId: 'REF-PV-PAY-018' });
  const retry = await callback({
    Authority: fixture.payment.transaction_id,
    Status: 'OK',
    orderId: fixture.order.id,
  });

  assert.equal(retry.status, 200);
  assert.equal(paymentCalls().filter(({ method }) => method === 'payment.verify').length, 2);
  await Promise.all([fixture.payment.reload(), fixture.order.reload()]);
  assert.equal(fixture.payment.status, 'success');
  assert.equal(fixture.order.status, 'processing');
  assert.equal(fixture.order.payment_status, 'paid');
});

test('PV-PAY-019 missing payment adapter fails closed and is restored exactly', async () => {
  const fixture = await createPaymentVariantFixture(db, {
    includePendingPayment: true,
    suffix: 'missing-adapter',
  });
  const productStockBefore = fixture.product.stock_quantity;
  const variantStockBefore = fixture.variant.stock_quantity;
  const orderItemBefore = await db.OrderItem.findByPk(fixture.orderItem.id, { raw: true });
  const originalPaymentAdapter = runtime.app.locals.adapters.payment;
  let response;

  try {
    delete runtime.app.locals.adapters.payment;
    response = await callback({
      Authority: fixture.payment.transaction_id,
      Status: 'OK',
      orderId: fixture.order.id,
    });
  } finally {
    runtime.app.locals.adapters.payment = originalPaymentAdapter;
  }

  assert.equal(runtime.app.locals.adapters.payment, originalPaymentAdapter);
  assert.equal(response.status, 503);
  assert.equal(paymentCalls().filter(({ method }) => method === 'payment.verify').length, 0);
  await Promise.all([
    fixture.payment.reload(),
    fixture.order.reload(),
    fixture.product.reload(),
    fixture.variant.reload(),
  ]);
  assert.equal(fixture.payment.status, 'pending');
  assert.equal(fixture.order.status, 'pending');
  assert.equal(fixture.order.payment_status, 'pending_payment_gateway');
  assert.equal(
    await db.OrderHistory.count({ where: { order_id: fixture.order.id, status: 'paid' } }),
    0,
  );
  assert.equal(fixture.product.stock_quantity, productStockBefore);
  assert.equal(fixture.variant.stock_quantity, variantStockBefore);
  assert.deepEqual(
    await db.OrderItem.findByPk(fixture.orderItem.id, { raw: true }),
    orderItemBefore,
  );
});
