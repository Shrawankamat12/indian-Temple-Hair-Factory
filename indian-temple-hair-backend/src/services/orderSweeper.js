const Order = require('../models/Order');
const orderService = require('./order.service');
const logger = require('../config/logger');

// Unpaid online orders hold reserved stock. If a shopper abandons PayPal, give the stock back after a grace period.
// Only orders that never reached a capture (pending / failed, no capture id, no PayPal approval in flight) are touched.
const GRACE_MS = Number(process.env.UNPAID_ORDER_HOLD_MINUTES || 120) * 60 * 1000;

async function sweepOnce(now = Date.now()) {
  const cutoff = new Date(now - GRACE_MS);
  const stale = await Order.find({
    'payment.method': 'paypal',
    'payment.status': { $in: ['pending', 'failed'] },
    'payment.paypalCaptureId': { $exists: false },
    orderStatus: 'pending',
    createdAt: { $lt: cutoff },
  }).limit(50);

  let released = 0;
  for (const o of stale) {
    // claim first (atomic) so a concurrent capture or second sweeper can't double-release
    const claimed = await Order.findOneAndUpdate(
      { _id: o._id, 'payment.status': { $in: ['pending', 'failed'] }, orderStatus: 'pending' },
      { $set: { 'payment.status': 'cancelled', orderStatus: 'cancelled', 'cancellation.isCancelled': true, 'cancellation.cancelledBy': 'system', 'cancellation.cancelledAt': new Date(), 'cancellation.reason': 'Payment not completed' } },
      { new: true }
    );
    if (!claimed) continue;
    await orderService.releaseStock(o.items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })));
    released += 1;
  }
  if (released) logger.info(`Released stock for ${released} unpaid PayPal order(s)`);
  return released;
}

function start() {
  const t = setInterval(() => sweepOnce().catch((e) => logger.error(`Order sweeper: ${e.message}`)), 15 * 60 * 1000);
  t.unref();
}

module.exports = { sweepOnce, start };
