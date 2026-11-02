'use strict';

function disableFileLogging() {
  const { logger, sendLoginLogger } = require('../../src/config/logger');
  for (const instance of [logger, sendLoginLogger]) {
    for (const transport of [...instance.transports]) {
      if (transport.constructor.name === 'File') {
        instance.remove(transport);
        if (typeof transport.close === 'function') transport.close();
      }
    }
  }
}

module.exports = { disableFileLogging };
