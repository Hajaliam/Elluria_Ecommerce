'use strict';

const SAFE_TEST_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);
const TEST_PORT = '55432';
const TEST_DATABASE = 'elluria_test';
const TEST_USER = 'elluria_test_user';

function assertDisposableTestDatabase(env = process.env) {
  const errors = [];
  const database = env.DB_NAME_TEST || '';
  const host = env.DB_HOST || '';
  const port = String(env.DB_PORT || '');

  if (env.NODE_ENV !== 'test') {
    errors.push('NODE_ENV must be exactly "test".');
  }
  if (!database.endsWith('_test')) {
    errors.push('DB_NAME_TEST must end with "_test".');
  }
  if (database !== TEST_DATABASE) {
    errors.push(`DB_NAME_TEST must be exactly "${TEST_DATABASE}".`);
  }
  if (!SAFE_TEST_HOSTS.has(host)) {
    errors.push('DB_HOST must resolve explicitly to the local machine.');
  }
  if (port !== TEST_PORT) {
    errors.push(`DB_PORT must be the isolated test port ${TEST_PORT}.`);
  }
  if (!env.DB_USER || !env.DB_PASSWORD) {
    errors.push('Disposable test DB credentials are required.');
  }
  if (env.DB_USER !== TEST_USER) {
    errors.push(`DB_USER must be exactly "${TEST_USER}".`);
  }
  if (
    database &&
    (database === env.DB_NAME_DEV || database === env.DB_NAME_PROD)
  ) {
    errors.push(
      'The test database name must differ from development and production.',
    );
  }

  if (errors.length > 0) {
    const error = new Error(
      `Test database guard rejected the environment:\n- ${errors.join('\n- ')}`,
    );
    error.code = 'ELLURIA_TEST_DB_GUARD';
    throw error;
  }

  return { database, host, port, environment: env.NODE_ENV };
}

if (require.main === module) {
  try {
    const safe = assertDisposableTestDatabase();
    console.log(
      `Test database guard accepted NODE_ENV=${safe.environment}, host=${safe.host}, port=${safe.port}, database=${safe.database}.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { assertDisposableTestDatabase };
