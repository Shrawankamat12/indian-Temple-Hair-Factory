const { body } = require('express-validator');

exports.paypalOrderRules = [body('orderId').notEmpty().withMessage('orderId is required')];
exports.paypalCaptureRules = [
  body('orderId').notEmpty().withMessage('orderId is required'),
  body('paypalOrderId').isString().trim().isLength({ min: 5, max: 64 }).withMessage('paypalOrderId is required'),
];

exports.createRazorpayOrderRules = [body('orderId').notEmpty().withMessage('orderId is required')];
exports.verifyRazorpayRules = [
  body('orderId').notEmpty().withMessage('orderId is required'),
  body('razorpayOrderId').notEmpty().withMessage('razorpayOrderId is required'),
  body('razorpayPaymentId').notEmpty().withMessage('razorpayPaymentId is required'),
  body('razorpaySignature').notEmpty().withMessage('razorpaySignature is required'),
];
