const asyncHandler = require('express-async-handler');
const paymentService = require('../services/payment.service');
const paymentConfig = require('../services/paymentConfig.service');
const paypalPayment = require('../services/paypalPayment.service');
const orderService = require('../services/order.service');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const ctx = (req) => ({ user: req.user, token: req.body?.accessToken || req.query?.token });

// GET /api/v1/payments/methods — what the checkout may offer. Public and secret-free.
exports.getMethods = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await paymentConfig.getPublicMethods() });
});

// POST /api/v1/payments/paypal/order { orderId, accessToken? } → { paypalOrderId }
// The charge is derived on the server from the stored, server-priced order. The body carries no amount.
exports.createPaypalOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getForCustomer(req.body.orderId, ctx(req));
  const data = await paypalPayment.createForOrder(order);
  res.json({ success: true, data });
});

// POST /api/v1/payments/paypal/capture { orderId, paypalOrderId, accessToken? }
exports.capturePaypalOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getForCustomer(req.body.orderId, ctx(req));
  const { order: updated, pending, alreadyProcessed } = await paypalPayment.captureForOrder(order, req.body.paypalOrderId);
  res.json({
    success: true,
    data: {
      orderNumber: updated.orderNumber,
      paymentStatus: updated.payment?.status,
      orderStatus: updated.orderStatus,
      paid: updated.payment?.status === 'paid',
      pending: !!pending,
      alreadyProcessed: !!alreadyProcessed,
    },
  });
});

// POST /api/v1/payments/paypal/webhook — mounted in app.js with a raw body so the signature can be verified.
exports.paypalWebhook = async (req, res) => {
  try {
    const out = await paypalPayment.handleWebhook(req.body, req.headers);
    res.status(200).json({ received: true, duplicate: !!out.duplicate });
  } catch (err) {
    if (err instanceof AppError && err.statusCode < 500) return res.status(err.statusCode).json({ received: false });
    logger.error(`PayPal webhook error: ${err.message}`);
    res.status(500).json({ received: false }); // PayPal will retry
  }
};

// ---- Razorpay (legacy, kept working but no longer offered by the storefront) ----
exports.getStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { configured: paymentService.isConfigured } });
});

exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getForCustomer(req.body.orderId, ctx(req));
  if (order.payment?.status === 'paid') throw new AppError('This order has already been paid', 400);
  const rpOrder = await paymentService.createRazorpayOrder(order.pricing.grandTotal, order.orderNumber);
  await orderService.updateById(order._id, { payment: { razorpayOrderId: rpOrder.id } });
  res.json({ success: true, data: { razorpayOrderId: rpOrder.id, amount: rpOrder.amount, currency: rpOrder.currency, keyId: process.env.RAZORPAY_KEY_ID, orderId: order._id, orderNumber: order.orderNumber } });
});

exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const order = await orderService.getForCustomer(orderId, ctx(req));
  if (order.payment?.razorpayOrderId !== razorpayOrderId) throw new AppError('Payment does not belong to this order', 400);
  paymentService.verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  const updated = await orderService.updateById(order._id, { payment: { status: 'paid', razorpayOrderId, razorpayPaymentId, razorpaySignature, paidAt: new Date() }, orderStatus: 'confirmed' });
  res.json({ success: true, data: { orderNumber: updated.orderNumber, paymentStatus: 'paid' } });
});
