const router = require('express').Router();
const c = require('../controllers/payment.controller');
const { optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { paypalOrderRules, paypalCaptureRules } = require('../validators/payment.validator');
const { paymentLimiter } = require('../middleware/rateLimiter.middleware');

router.get('/methods', c.getMethods);

// PayPal (the webhook itself is mounted in app.js ahead of the JSON body parser)
router.post('/paypal/order', paymentLimiter, optionalAuth, paypalOrderRules, validate, c.createPaypalOrder);
router.post('/paypal/capture', paymentLimiter, optionalAuth, paypalCaptureRules, validate, c.capturePaypalOrder);

// Razorpay (legacy, INR-only) has been switched off: the store is USD-only and PayPal is the only online gateway.
// (Left on, these routes would have charged the USD order total as if it were rupees.)

module.exports = router;
