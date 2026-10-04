const { body } = require('express-validator');

exports.submitWholesaleRules = [
  body('contactName').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('businessName').optional({ checkFalsy: true }).trim().isLength({ max: 160 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail({ gmail_remove_dots: false }),
  body('phone').trim().notEmpty().withMessage('Phone is required').isLength({ max: 30 }),
  body('country').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('subject').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('enquiryType').optional({ checkFalsy: true }).isIn(['wholesale', 'bulk_order', 'export', 'private_label', 'general']).withMessage('Invalid enquiry type'),
  body('message').optional({ checkFalsy: true }).trim().isLength({ max: 4000 }),
  body('requirement').optional({ checkFalsy: true }).trim().isLength({ max: 4000 }),
  body('estimatedMOQ').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
];
