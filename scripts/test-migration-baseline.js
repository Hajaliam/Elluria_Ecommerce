'use strict';

const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');
const { assertDisposableTestDatabase } = require('./test-db-guard');

const projectRoot = path.resolve(__dirname, '..');
dotenv.config({
  path: path.join(projectRoot, '.env.test'),
  override: true,
  quiet: true,
});

assertDisposableTestDatabase(process.env);

const action = process.argv[2];
const commands = {
  up: 'db:migrate',
  status: 'db:migrate:status',
};

if (!commands[action]) {
  console.error('Usage: node scripts/test-migration-baseline.js <up|status>');
  process.exit(2);
}

const sequelizeCli = require.resolve('sequelize-cli/lib/sequelize');
const result = spawnSync(
  process.execPath,
  [
    sequelizeCli,
    commands[action],
    '--env',
    'test',
    '--config',
    path.join(projectRoot, 'config', 'config.test-baseline.js'),
    '--migrations-path',
    path.join(projectRoot, 'migrations'),
  ],
  {
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: 'test' },
    stdio: 'inherit',
  },
);

if (result.error) {
  throw result.error;
}
process.exit(result.status ?? 1);
