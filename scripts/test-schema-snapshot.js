'use strict';

const fs = require('fs');
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

const dockerCommand = process.platform === 'win32' ? 'docker.exe' : 'docker';
const result = spawnSync(
  dockerCommand,
  [
    'compose',
    '-f',
    path.join(projectRoot, 'compose.test.yml'),
    'exec',
    '-T',
    'elluria-postgres-test',
    'pg_dump',
    '--username=elluria_test_user',
    '--dbname=elluria_test',
    '--schema-only',
    '--no-owner',
    '--no-privileges',
  ],
  { cwd: projectRoot, encoding: 'utf8' },
);

if (result.error) throw result.error;
if (result.status !== 0) {
  process.stderr.write(result.stderr || 'Schema snapshot failed.\n');
  process.exit(result.status ?? 1);
}

const outputPath = path.join(
  projectRoot,
  'docs',
  'project-audit',
  'migration-schema.sql',
);
fs.writeFileSync(outputPath, result.stdout, 'utf8');
console.log(`Schema-only snapshot written to ${outputPath}`);
