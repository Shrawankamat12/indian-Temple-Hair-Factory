const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // the order that proves the purchase, when there is one
  name: String,
  title: { type: String, trim: true, maxlength: 120 },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  verifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false }, // legacy flag, kept in sync with `status`

  // --- Admin panel fields ---
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'hidden'], default: 'pending' },
  images: [{ type: String }],
  reply: { type: String },
}, { timestamps: true });

// Product page fetches approved reviews for one product, newest first.
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
// One review per customer per product (partial: legacy/anonymous rows without a user are not constrained).
reviewSchema.index({ product: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } });

module.exports = mongoose.model('Review', reviewSchema);
