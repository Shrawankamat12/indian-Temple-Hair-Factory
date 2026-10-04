const { body } = require('express-validator');

exports.submitContactRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('company').optional({ checkFalsy: true }).trim().isLength({ max: 160 }),
  body('country').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('subject').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('enquiryType').optional({ checkFalsy: true }).isIn(['general', 'order', 'product', 'shipping', 'wholesale', 'other']).withMessage('Invalid enquiry type'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 4000 }),
];
