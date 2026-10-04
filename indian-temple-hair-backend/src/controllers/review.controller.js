const asyncHandler = require('express-async-handler');
const reviewService = require('../services/review.service');

// GET /api/v1/reviews/product/:productId?page=&limit=
// `data` stays the plain array the storefront already reads; `summary` carries average / count / 1-5 star distribution.
exports.getProductReviews = asyncHandler(async (req, res) => {
  const { reviews, summary, page, pages } = await reviewService.getProductReviews(req.params.productId, req.query);
  res.json({ success: true, data: reviews, summary, page, pages });
});

// GET /api/v1/reviews/product/:productId/eligibility — can the signed-in customer review this product?
exports.getEligibility = asyncHandler(async (req, res) => {
  const existing = await reviewService.repository.model.findOne({ product: req.params.productId, user: req.user._id }).select('status').lean();
  const purchase = await reviewService.findPurchase(req.user._id, req.params.productId);
  res.json({ success: true, data: { alreadyReviewed: !!existing, reviewStatus: existing?.status || null, verifiedPurchase: !!purchase } });
});

exports.createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user, req.body);
  res.status(201).json({ success: true, data: review });
});

exports.getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const reviews = await reviewService.listAllAdmin(filter);
  res.json({ success: true, data: reviews });
});

// PUT /api/v1/admin/reviews/:id — generic update (approve/reject via status, or post a reply)
exports.updateReviewAdmin = asyncHandler(async (req, res) => {
  const review = await reviewService.updateAdmin(req.params.id, req.body);
  res.json({ success: true, data: review });
});

exports.approveReview = asyncHandler(async (req, res) => {
  const review = await reviewService.approve(req.params.id);
  res.json({ success: true, data: review });
});

exports.replyToReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateAdmin(req.params.id, { reply: req.body.message });
  res.json({ success: true, data: review });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteAdmin(req.params.id);
  res.json({ success: true, message: 'Review deleted' });
});
