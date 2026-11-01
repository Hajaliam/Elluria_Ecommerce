'use strict';

const path = require('path');
const dotenv = require('dotenv');
const { assertDisposableTestDatabase } = require('../scripts/test-db-guard');

dotenv.config({
  path: path.resolve(__dirname, '..', '.env.test'),
  override: true,
  quiet: true,
});

const safe = assertDisposableTestDatabase(process.env);

module.exports = {
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: safe.database,
    host: safe.host,
    port: Number(safe.port),
    dialect: 'postgres',
    logging: false,
  },
};
