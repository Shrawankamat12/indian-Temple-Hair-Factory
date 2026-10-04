const router = require('express').Router();
const c = require('../controllers/payment.controller');
const { optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { paypalOrderRules, paypalCaptureRules, createRazorpayOrderRules, verifyRazorpayRules } = require('../validators/payment.validator');
const { paymentLimiter } = require('../middleware/rateLimiter.middleware');

router.get('/methods', c.getMethods);

// PayPal (the webhook itself is mounted in app.js ahead of the JSON body parser)
router.post('/paypal/order', paymentLimiter, optionalAuth, paypalOrderRules, validate, c.createPaypalOrder);
router.post('/paypal/capture', paymentLimiter, optionalAuth, paypalCaptureRules, validate, c.capturePaypalOrder);

// Razorpay (legacy)
router.get('/razorpay/status', c.getStatus);
router.post('/razorpay/order', paymentLimiter, optionalAuth, createRazorpayOrderRules, validate, c.createRazorpayOrder);
router.post('/razorpay/verify', paymentLimiter, optionalAuth, verifyRazorpayRules, validate, c.verifyRazorpayPayment);

module.exports = router;
