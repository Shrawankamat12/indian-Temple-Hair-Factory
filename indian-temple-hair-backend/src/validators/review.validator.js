const { body } = require('express-validator');

exports.createReviewRules = [
  body('productId').isMongoId().withMessage('Valid product id is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional({ checkFalsy: true }).isString().trim().isLength({ max: 120 }).withMessage('Title is too long'),
  body('comment').isString().trim().isLength({ min: 5, max: 2000 }).withMessage('Review must be 5–2000 characters'),
];
