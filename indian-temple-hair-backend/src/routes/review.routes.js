const router = require('express').Router();
const { getProductReviews, createReview, getEligibility } = require('../controllers/review.controller');
const { reviewLimiter } = require('../middleware/rateLimiter.middleware');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createReviewRules } = require('../validators/review.validator');

router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/eligibility', protect, getEligibility);
router.post('/', protect, reviewLimiter, createReviewRules, validate, createReview);

module.exports = router;
