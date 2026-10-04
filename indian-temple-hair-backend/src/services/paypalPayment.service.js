const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const Order = require('../models/Order');
const Setting = require('../models/Setting');
const WebhookEvent = require('../models/WebhookEvent');
const paypal = require('./paypal.service');

// Orchestrates PayPal payments against our own orders.
// Rule: an order only becomes `paid` from a server-verified PayPal capture (API response or signed webhook) —
// never because the browser says it succeeded.

const OPEN_STATES = ['pending', 'processing', 'failed', 'cancelled'];

function assertPayable(order) {
  if (order.payment?.method !== 'paypal') throw new AppError('This order is not a PayPal order', 400);
  if (order.payment?.status === 'paid') throw new AppError('This order has already been paid', 400);
  if (['cancelled', 'refunded', 'returned'].includes(order.orderStatus)) throw new AppError('This order can no longer be paid', 400);
}

async function createForOrder(order) {
  assertPayable(order);
  const setting = await Setting.findOne().lean();
  const { paypalOrderId, charge } = await paypal.createOrder(order, { brandName: setting?.storeName });
  await Order.updateOne(
    { _id: order._id, 'payment.status': { $in: OPEN_STATES } },
    { $set: {
      'payment.paypalOrderId': paypalOrderId,
      'payment.amount': Number(charge.value),
      'payment.currency': charge.currency,
      'payment.exchangeRate': charge.rate,
      'payment.status': 'pending',
    } }
  );
  return { paypalOrderId, amount: charge.value, currency: charge.currency };
}

/** Sets an order to paid exactly once. Returns the updated order for the caller that won, null for everyone else. */
async function markPaid(orderId, { captureId, amount, currency, eventId }) {
  const won = await Order.findOneAndUpdate(
    { _id: orderId, 'payment.status': { $ne: 'paid' } },
    { $set: {
      'payment.status': 'paid',
      'payment.paypalCaptureId': captureId,
      'payment.transactionId': captureId,
      'payment.paidAt': new Date(),
      'payment.amount': Number(amount),
      'payment.currency': currency,
      'payment.failureReason': '',
      ...(eventId && { 'payment.lastEventId': eventId }),
      isPaid: true,
    } },
    { new: true }
  );
  if (!won) return null;
  await Order.updateOne(
    { _id: orderId, orderStatus: { $in: ['pending', 'placed'] } },
    { $set: { orderStatus: 'confirmed' }, $push: { statusHistory: { status: 'confirmed', note: 'Payment received via PayPal', at: new Date() } } }
  );
  return won;
}

async function markNotPaid(orderId, status, reason) {
  return Order.findOneAndUpdate(
    { _id: orderId, 'payment.status': { $in: OPEN_STATES } },
    { $set: { 'payment.status': status, 'payment.failureReason': reason || '' } },
    { new: true }
  );
}

/** True only when the capture matches what we asked PayPal to charge for THIS order. */
function captureMatchesOrder(cap, order) {
  return (
    cap.captureStatus === 'COMPLETED' &&
    String(cap.customId || '') === String(order.orderNumber) &&
    Number(cap.value) === Number(order.payment?.amount) &&
    String(cap.currency) === String(order.payment?.currency)
  );
}

async function captureForOrder(order, paypalOrderId) {
  assertPayable(order);
  if (!order.payment.paypalOrderId || order.payment.paypalOrderId !== paypalOrderId) {
    throw new AppError('This PayPal payment does not belong to the order', 400);
  }
  // claim the order for capture so two parallel clicks don't both hit PayPal
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, 'payment.status': { $in: OPEN_STATES } },
    { $set: { 'payment.status': 'processing' } },
    { new: true }
  );
  if (!claimed) return { order: await Order.findById(order._id), alreadyProcessed: true };

  let result;
  try {
    result = await paypal.captureOrder(paypalOrderId);
  } catch (err) {
    // transport / auth failure: outcome unknown, leave it Processing — the webhook settles it if money moved
    logger.error(`PayPal capture call failed for ${order.orderNumber}: ${err.message}`);
    throw new AppError('We could not confirm your payment yet. If you were charged, your order will be confirmed shortly.', 502);
  }

  if (!result.ok) {
    const issue = result.body?.details?.[0]?.issue || result.body?.name || `HTTP ${result.status}`;
    if (issue === 'INSTRUMENT_DECLINED' || issue === 'PAYER_ACTION_REQUIRED' || result.status === 422) {
      await markNotPaid(order._id, 'failed', issue);
      throw new AppError('PayPal declined this payment. You have not been charged — please try again or use another method.', 402);
    }
    logger.error(`PayPal capture rejected for ${order.orderNumber}: ${issue}`);
    throw new AppError('We could not confirm your payment yet. If you were charged, your order will be confirmed shortly.', 502);
  }

  const cap = paypal.readCapture(result.body);
  if (cap.captureStatus === 'PENDING') {
    return { order: await Order.findById(order._id), pending: true }; // stays Processing; webhook completes it
  }
  if (!captureMatchesOrder(cap, claimed)) {
    logger.error(`PayPal capture verification failed for ${order.orderNumber}: ${JSON.stringify(cap)}`);
    await markNotPaid(order._id, 'failed', 'capture_verification_failed');
    throw new AppError('Your payment could not be verified. Please contact us on the number shown on this site.', 409);
  }
  const won = await markPaid(order._id, { captureId: cap.captureId, amount: cap.value, currency: cap.currency });
  return { order: won || (await Order.findById(order._id)), alreadyProcessed: !won };
}

/** Signed webhook. Throws AppError(400) for unverifiable payloads; safe to call repeatedly with the same event. */
async function handleWebhook(rawBody, headers) {
  let event;
  try { event = JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody)); }
  catch { throw new AppError('Invalid webhook body', 400); }
  if (!event?.id || !event?.event_type) throw new AppError('Invalid webhook body', 400);

  if (!(await paypal.verifyWebhook(headers, event))) throw new AppError('Webhook signature verification failed', 400);

  try {
    await WebhookEvent.create({ eventId: event.id, eventType: event.event_type, resourceId: event.resource?.id });
  } catch (err) {
    if (err && err.code === 11000) return { duplicate: true }; // already handled — idempotent no-op
    throw err;
  }

  try {
    const outcome = await applyEvent(event);
    await WebhookEvent.updateOne({ eventId: event.id }, { $set: { outcome: outcome.outcome, note: outcome.note, orderNumber: outcome.orderNumber } });
    return { duplicate: false, ...outcome };
  } catch (err) {
    await WebhookEvent.deleteOne({ eventId: event.id }).catch(() => {}); // let PayPal's retry re-process it
    throw err;
  }
}

async function findOrderForResource(resource) {
  const number = resource?.custom_id || resource?.invoice_id;
  if (number) { const o = await Order.findOne({ orderNumber: number }); if (o) return o; }
  const ppOrderId = resource?.supplementary_data?.related_ids?.order_id || resource?.id;
  return ppOrderId ? Order.findOne({ 'payment.paypalOrderId': ppOrderId }) : null;
}

async function applyEvent(event) {
  const r = event.resource || {};
  const type = event.event_type;
  const order = await findOrderForResource(r);
  if (!order) return { outcome: 'ignored', note: 'no matching order' };
  const base = { orderNumber: order.orderNumber };

  switch (type) {
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const cap = { captureStatus: r.status, customId: r.custom_id || r.invoice_id, value: r.amount?.value, currency: r.amount?.currency_code };
      if (!captureMatchesOrder(cap, order)) return { ...base, outcome: 'error', note: 'amount/currency/reference mismatch — not marked paid' };
      const won = await markPaid(order._id, { captureId: r.id, amount: r.amount.value, currency: r.amount.currency_code, eventId: event.id });
      return { ...base, outcome: won ? 'applied' : 'ignored', note: won ? 'marked paid' : 'already paid' };
    }
    case 'PAYMENT.CAPTURE.PENDING': {
      await Order.updateOne({ _id: order._id, 'payment.status': { $in: ['pending', 'processing'] } }, { $set: { 'payment.status': 'processing' } });
      return { ...base, outcome: 'applied', note: 'processing' };
    }
    case 'PAYMENT.CAPTURE.DENIED':
    case 'PAYMENT.CAPTURE.DECLINED': {
      const u = await markNotPaid(order._id, 'failed', type);
      return { ...base, outcome: u ? 'applied' : 'ignored', note: u ? 'marked failed' : 'order not in an open payment state' };
    }
    case 'PAYMENT.CAPTURE.REFUNDED':
    case 'PAYMENT.CAPTURE.REVERSED': {
      if (order.payment?.paypalCaptureId && r.id && order.payment.paypalCaptureId !== r.id && r.supplementary_data?.related_ids?.capture_id !== order.payment.paypalCaptureId) {
        return { ...base, outcome: 'ignored', note: 'refund for a different capture' };
      }
      await Order.updateOne({ _id: order._id, 'payment.status': 'paid' }, { $set: { 'payment.status': 'refunded', isPaid: false } });
      return { ...base, outcome: 'applied', note: 'marked refunded (initiated from PayPal dashboard)' };
    }
    case 'CHECKOUT.ORDER.APPROVED': {
      await Order.updateOne({ _id: order._id, 'payment.status': 'pending', 'payment.paypalOrderId': r.id }, { $set: { 'payment.status': 'processing' } });
      return { ...base, outcome: 'applied', note: 'approved by buyer' };
    }
    default:
      return { ...base, outcome: 'ignored', note: `unhandled event ${type}` };
  }
}

module.exports = { createForOrder, captureForOrder, handleWebhook, markPaid, captureMatchesOrder };
