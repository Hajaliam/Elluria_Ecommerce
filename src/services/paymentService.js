'use strict';

const PAYMENT_PENDING = 'pending';
const PAYMENT_SUCCESS = 'success';
const ORDER_PENDING = 'pending';
const ORDER_PROCESSING = 'processing';
const ORDER_PAYMENT_PENDING = 'pending_payment_gateway';
const ORDER_PAYMENT_PAID = 'paid';

class PaymentCallbackError extends Error {
  constructor(message, statusCode = 400, code = 'INVALID_CALLBACK') {
    super(message);
    this.name = 'PaymentCallbackError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function moneyToMinorUnits(value) {
  const match = String(value).match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) throw new PaymentCallbackError('Stored payment amount is invalid.');
  return (BigInt(match[1]) * 100n) + BigInt((match[2] || '').padEnd(2, '0'));
}

function assertBoundState(payment, order, authority, callbackOrderId) {
  if (!payment || !order || payment.order_id !== order.id || payment.transaction_id !== authority) {
    throw new PaymentCallbackError('Payment callback does not match a registered payment.');
  }

  if (callbackOrderId !== undefined && callbackOrderId !== null && callbackOrderId !== '') {
    if (!/^\d+$/.test(String(callbackOrderId)) || Number(callbackOrderId) !== payment.order_id) {
      throw new PaymentCallbackError('Payment callback order does not match the registered payment.');
    }
  }

  if (moneyToMinorUnits(payment.amount) !== moneyToMinorUnits(order.total_amount)) {
    throw new PaymentCallbackError('Stored payment and order amounts do not match.');
  }
}

function isFinalized(payment, order) {
  return payment.status === PAYMENT_SUCCESS
    && order.payment_status === ORDER_PAYMENT_PAID
    && order.status === ORDER_PROCESSING;
}

function assertPending(payment, order) {
  if (payment.status !== PAYMENT_PENDING
      || order.payment_status !== ORDER_PAYMENT_PENDING
      || order.status !== ORDER_PENDING) {
    throw new PaymentCallbackError('Payment is not in a verifiable state.');
  }
}

async function verifyAndFinalize({ database, paymentAdapter, authority, callbackOrderId }) {
  if (!authority || typeof authority !== 'string') {
    throw new PaymentCallbackError('Payment Authority is required.');
  }

  const payment = await database.Payment.findOne({ where: { transaction_id: authority } });
  if (!payment) {
    throw new PaymentCallbackError('Unknown payment Authority.');
  }
  const order = await database.Order.findByPk(payment.order_id);
  assertBoundState(payment, order, authority, callbackOrderId);

  if (isFinalized(payment, order)) {
    return { payment, order, alreadyFinalized: true, verified: false };
  }
  assertPending(payment, order);

  if (!paymentAdapter || typeof paymentAdapter.verify !== 'function') {
    throw new PaymentCallbackError('Payment provider is unavailable.', 503, 'PROVIDER_UNAVAILABLE');
  }

  let verification;
  try {
    verification = await paymentAdapter.verify({
      authority,
      amount: payment.amount,
      orderId: payment.order_id,
    });
  } catch (error) {
    throw new PaymentCallbackError('Payment provider is unavailable.', 502, 'PROVIDER_ERROR');
  }
  if (!verification || verification.verified !== true) {
    throw new PaymentCallbackError('Payment could not be verified.', 400, 'VERIFICATION_FAILED');
  }

  return database.sequelize.transaction(async (transaction) => {
    const lockedPayment = await database.Payment.findOne({
      where: { transaction_id: authority },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!lockedPayment) {
      throw new PaymentCallbackError('Unknown payment Authority.');
    }
    const lockedOrder = await database.Order.findByPk(lockedPayment.order_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    assertBoundState(lockedPayment, lockedOrder, authority, callbackOrderId);

    if (isFinalized(lockedPayment, lockedOrder)) {
      return {
        payment: lockedPayment,
        order: lockedOrder,
        alreadyFinalized: true,
        verified: true,
      };
    }
    assertPending(lockedPayment, lockedOrder);

    lockedPayment.status = PAYMENT_SUCCESS;
    lockedPayment.payment_date = new Date();
    await lockedPayment.save({ transaction });

    lockedOrder.payment_status = ORDER_PAYMENT_PAID;
    lockedOrder.status = ORDER_PROCESSING;
    await lockedOrder.save({ transaction });

    await database.OrderHistory.create({
      order_id: lockedOrder.id,
      status: ORDER_PAYMENT_PAID,
      changed_by: lockedOrder.user_id,
      changed_at: new Date(),
    }, { transaction });

    return {
      payment: lockedPayment,
      order: lockedOrder,
      alreadyFinalized: false,
      verified: true,
    };
  });
}

module.exports = {
  PaymentCallbackError,
  verifyAndFinalize,
};
