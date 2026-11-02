'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { assertDisposableTestDatabase } = require('../../scripts/test-db-guard');

const valid = {
  NODE_ENV: 'test', DB_HOST: '127.0.0.1', DB_PORT: '55432',
  DB_NAME_TEST: 'elluria_test', DB_USER: 'elluria_test_user',
  DB_PASSWORD: 'not-empty', DB_NAME_DEV: 'elluria_dev', DB_NAME_PROD: 'elluria_prod',
};

test('accepts the exact disposable PostgreSQL identity', () => {
  assert.deepEqual(assertDisposableTestDatabase(valid), {
    database: 'elluria_test', host: '127.0.0.1', port: '55432', environment: 'test',
  });
});

for (const [name, patch] of [
  ['rejects a non-test NODE_ENV', { NODE_ENV: 'development' }],
  ['rejects a non-local host', { DB_HOST: 'db.internal' }],
  ['rejects a different port', { DB_PORT: '5432' }],
  ['rejects another database even with a _test suffix', { DB_NAME_TEST: 'other_test' }],
  ['rejects another database user', { DB_USER: 'postgres' }],
]) {
  test(name, () => {
    assert.throws(
      () => assertDisposableTestDatabase({ ...valid, ...patch }),
      (error) => error.code === 'ELLURIA_TEST_DB_GUARD',
    );
  });
}
