'use strict';

function createProductionAdapters() {
  const email = require('./src/utils/emailService');
  const sms = require('./src/utils/smsService');
  const { getAIResponse } = require('./src/utils/aiService');
  return {
    ai: { getResponse: getAIResponse },
    email,
    sms,
    payment: {
      async initiate() {
        throw new Error('The current payment flow is simulated inside its controller.');
      },
      async verify() {
        throw new Error('The current payment flow is simulated inside its controller.');
      },
    },
    backup: null,
  };
}

function startProduction() {
  require('global-agent/bootstrap');
  require('dotenv').config();
  process.env.GLOBAL_AGENT_HTTP_PROXY = 'http://127.0.0.1:10809';
  const { logger } = require('./src/config/logger');
  const { createApplication } = require('./src/app');
  const backupService = require('./src/utils/backupService');
  const { startExpiredOrderCleanupScheduler } = require('./src/utils/orderCleanupService');
  const adapters = createProductionAdapters();
  adapters.backup = { execute: backupService.runBackupAndCleanup };
  const runtime = createApplication({ adapters });
  const port = process.env.PORT || 3000;

  runtime.server.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Database User: ${process.env.DB_USER}`);
    backupService.startBackupScheduler();
    startExpiredOrderCleanupScheduler();
  });
  return runtime;
}

if (require.main === module) startProduction();

module.exports = { createProductionAdapters, startProduction };
