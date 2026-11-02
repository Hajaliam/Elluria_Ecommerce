'use strict';

const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env.test'), override: true, quiet: true });

const test = require('node:test');
const { after } = require('node:test');
const assert = require('node:assert/strict');
const { assertDisposableTestDatabase } = require('../../scripts/test-db-guard');
const { createFakeAdapters } = require('../support/fake-adapters');
const { disableFileLogging } = require('../support/disable-file-logging');

assertDisposableTestDatabase(process.env);
disableFileLogging();
const db = require('../../models');
const { createApplication } = require('../../src/app');

after(async () => {
  await db.sequelize.close();
});

test('DB smoke: exact test database, 39 migrations, and all model associations load', async () => {
  await db.sequelize.authenticate();
  const [identity] = await db.sequelize.query('SELECT current_database() AS database, current_user AS username');
  assert.deepEqual(identity[0], { database: 'elluria_test', username: 'elluria_test_user' });
  const [meta] = await db.sequelize.query('SELECT COUNT(*)::int AS count FROM "SequelizeMeta"');
  assert.equal(meta[0].count, 39);
  const modelNames = Object.keys(db).filter((name) => !['sequelize', 'Sequelize'].includes(name));
  assert.equal(modelNames.length, 31);
  for (const modelName of modelNames) assert.ok(db[modelName].associations);
});

test('HTTP smoke uses an ephemeral port and closes HTTP plus Socket.IO', async () => {
  const { adapters, calls } = createFakeAdapters();
  const runtime = createApplication({ adapters, database: db });
  try {
    await new Promise((resolve, reject) => {
      runtime.server.once('error', reject);
      runtime.server.listen(0, '127.0.0.1', resolve);
    });
    const address = runtime.server.address();
    const base = `http://127.0.0.1:${address.port}`;
    const root = await fetch(`${base}/`);
    assert.equal(root.status, 200);
    assert.equal(await root.text(), 'Welcome to the E-commerce Backend API!');
    const csrf = await fetch(`${base}/api/csrf-token`);
    assert.equal(csrf.status, 200);
    assert.match((await csrf.json()).csrfToken, /^[A-Za-z0-9+/_=-]+$/);
    assert.deepEqual(calls, []);
  } finally {
    await runtime.close();
  }
  assert.equal(runtime.server.listening, false);
});
