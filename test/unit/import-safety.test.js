'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const https = require('node:https');
const cron = require('node-cron');
const { createFakeAdapters } = require('../support/fake-adapters');
const { disableFileLogging } = require('../support/disable-file-logging');

disableFileLogging();

test('importing and composing the application does not listen, schedule, or call network/process adapters', async () => {
  const observed = { listen: 0, schedule: 0, request: 0 };
  const originals = {
    listen: http.Server.prototype.listen,
    schedule: cron.schedule,
    httpRequest: http.request,
    httpsRequest: https.request,
  };
  http.Server.prototype.listen = function blockedListen() { observed.listen += 1; return this; };
  cron.schedule = () => { observed.schedule += 1; throw new Error('scheduler must not start'); };
  http.request = () => { observed.request += 1; throw new Error('network must not start'); };
  https.request = () => { observed.request += 1; throw new Error('network must not start'); };

  try {
    const { createApplication } = require('../../src/app');
    const { adapters, calls } = createFakeAdapters();
    const runtime = createApplication({ adapters });
    assert.deepEqual(observed, { listen: 0, schedule: 0, request: 0 });
    assert.deepEqual(calls, []);
    await runtime.close();
  } finally {
    http.Server.prototype.listen = originals.listen;
    cron.schedule = originals.schedule;
    http.request = originals.httpRequest;
    https.request = originals.httpsRequest;
  }
});

test('cold-importing the production entry point does not load app or start runtime work', () => {
  const serverPath = require.resolve('../../server');
  const appPath = require.resolve('../../src/app');
  const cachedServer = require.cache[serverPath];
  const cachedApp = require.cache[appPath];
  const hadProxy = Object.hasOwn(process.env, 'GLOBAL_AGENT_HTTP_PROXY');
  const proxyBefore = process.env.GLOBAL_AGENT_HTTP_PROXY;
  const observed = { listen: 0, schedule: 0, request: 0 };
  const originals = {
    listen: http.Server.prototype.listen,
    schedule: cron.schedule,
    httpRequest: http.request,
    httpsRequest: https.request,
  };
  delete require.cache[serverPath];
  delete require.cache[appPath];
  http.Server.prototype.listen = function blockedListen() { observed.listen += 1; return this; };
  cron.schedule = () => { observed.schedule += 1; throw new Error('scheduler must not start'); };
  http.request = () => { observed.request += 1; throw new Error('network must not start'); };
  https.request = () => { observed.request += 1; throw new Error('network must not start'); };

  try {
    const entry = require('../../server');
    assert.equal(typeof entry.startProduction, 'function');
    assert.equal(require.cache[appPath], undefined);
    assert.equal(process.env.GLOBAL_AGENT_HTTP_PROXY, proxyBefore);
    assert.deepEqual(observed, { listen: 0, schedule: 0, request: 0 });
  } finally {
    http.Server.prototype.listen = originals.listen;
    cron.schedule = originals.schedule;
    http.request = originals.httpRequest;
    https.request = originals.httpsRequest;
    if (hadProxy) process.env.GLOBAL_AGENT_HTTP_PROXY = proxyBefore;
    else delete process.env.GLOBAL_AGENT_HTTP_PROXY;
    delete require.cache[serverPath];
    delete require.cache[appPath];
    if (cachedServer) require.cache[serverPath] = cachedServer;
    if (cachedApp) require.cache[appPath] = cachedApp;
  }
});
