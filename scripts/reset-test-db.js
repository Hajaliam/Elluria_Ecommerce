'use strict';

const path = require('node:path');
const dotenv = require('dotenv');
const { Client } = require('pg');
const { assertDisposableTestDatabase } = require('./test-db-guard');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.test'), override: true, quiet: true });
assertDisposableTestDatabase(process.env);

function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

async function resetTestDatabase() {
  const client = new Client({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME_TEST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  });
  await client.connect();
  try {
    const identity = await client.query('SELECT current_database() AS database, current_user AS username');
    if (identity.rows[0].database !== 'elluria_test' || identity.rows[0].username !== 'elluria_test_user') {
      throw new Error('Connected PostgreSQL identity does not match the guarded test database.');
    }
    const tables = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'SequelizeMeta' ORDER BY tablename`,
    );
    await client.query('BEGIN');
    if (tables.rows.length > 0) {
      const names = tables.rows.map(({ tablename }) => `public.${quoteIdentifier(tablename)}`).join(', ');
      await client.query(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  resetTestDatabase().then(() => console.log('Test database application tables reset safely.')).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { resetTestDatabase };
