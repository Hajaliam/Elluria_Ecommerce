'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const dotenv = require('dotenv');
const { assertDisposableTestDatabase } = require('./test-db-guard');

const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env.test'), override: true, quiet: true });
assertDisposableTestDatabase(process.env);

function dockerExecutable() {
  if (process.platform !== 'win32') return 'docker';
  const local = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'DockerDesktop', 'resources', 'bin', 'docker.exe');
  return fs.existsSync(local) ? local : 'docker.exe';
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: 'test' },
    stdio: 'inherit',
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${path.basename(command)} exited with status ${result.status}.`);
}

const docker = dockerExecutable();
const compose = ['compose', '--project-name', 'elluria-runtime-test', '--file', path.join(projectRoot, 'compose.test.yml')];
let failure = null;

try {
  run(docker, [...compose, 'up', '--detach', '--wait']);
  run(process.execPath, [path.join(projectRoot, 'scripts', 'test-migration-baseline.js'), 'up']);
  run(process.execPath, [path.join(projectRoot, 'scripts', 'reset-test-db.js')]);
  run(process.execPath, ['--test', '--test-concurrency=1', path.join(projectRoot, 'test', 'integration', '*.test.js')]);
} catch (error) {
  failure = error;
  console.error(error.message);
} finally {
  try {
    run(docker, [...compose, 'down', '--volumes', '--remove-orphans']);
  } catch (cleanupError) {
    failure ||= cleanupError;
    console.error(`Test resource cleanup failed: ${cleanupError.message}`);
  }
}

if (failure) process.exitCode = 1;
