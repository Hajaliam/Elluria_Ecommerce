'use strict';

function createFakeMethod(name, calls, initialResult) {
  let result = initialResult;
  let failure = null;
  const method = async (...args) => {
    calls.push({ method: name, args });
    if (failure) throw failure;
    return typeof result === 'function' ? result(...args) : result;
  };
  method.respondWith = (value) => { result = value; failure = null; };
  method.failWith = (error) => { failure = error instanceof Error ? error : new Error(String(error)); };
  return method;
}

function createFakeAdapters() {
  const calls = [];
  const adapters = {
    ai: { getResponse: createFakeMethod('ai.getResponse', calls, 'پاسخ قطعی تست') },
    email: { sendMail: createFakeMethod('email.sendMail', calls, { messageId: 'fake-email-1' }) },
    sms: {
      sendSms: createFakeMethod('sms.sendSms', calls, { status: 200 }),
      sendPasswordResetCode: createFakeMethod('sms.sendPasswordResetCode', calls, { status: 200 }),
      sendOtpCode: createFakeMethod('sms.sendOtpCode', calls, { status: 200 }),
    },
    payment: {
      initiate: createFakeMethod('payment.initiate', calls, { authority: 'fake-authority' }),
      verify: createFakeMethod('payment.verify', calls, { verified: true }),
    },
    backup: { execute: createFakeMethod('backup.execute', calls, { completed: true }) },
  };
  return { adapters, calls };
}

module.exports = { createFakeAdapters };
