'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFakeAdapters } = require('../support/fake-adapters');

test('fake AI default response preserves its exact UTF-8 text', async () => {
  const { adapters } = createFakeAdapters();
  assert.equal(await adapters.ai.getResponse('test prompt', []), 'پاسخ قطعی تست');
});

test('fake adapters record inputs and return deterministic configurable responses', async () => {
  const { adapters, calls } = createFakeAdapters();
  adapters.payment.initiate.respondWith({ authority: 'configured' });
  assert.deepEqual(await adapters.payment.initiate({ orderId: 42 }), { authority: 'configured' });
  assert.deepEqual(calls, [{ method: 'payment.initiate', args: [{ orderId: 42 }] }]);
});

test('fake adapters can simulate failures without external work', async () => {
  const { adapters } = createFakeAdapters();
  adapters.email.sendMail.failWith(new Error('configured SMTP failure'));
  await assert.rejects(
    adapters.email.sendMail({ to: 'test@example.invalid' }),
    /configured SMTP failure/,
  );
});
