const mongoose = require('mongoose');
const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { reviewRepository, productRepository } = require('../repositories');
const Order = require('../models/Order');

const VISIBLE = 'approved'; // the only status the storefront may ever show

/** Plain-text only: strips tags/control chars, collapses whitespace, caps length. */
function clean(text, max) {
  return String(text ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}
const LINKS = /(https?:\/\/|www\.)\S+/gi;

/** Builds {average,count,distribution} from a list of {_id: rating, count}. Pure, so it can be unit tested. */
function summarise(rows) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0; let sum = 0;
  for (const r of rows || []) {
    const star = Number(r._id);
    if (star >= 1 && star <= 5) { distribution[star] = r.count; total += r.count; sum += star * r.count; }
  }
  return { average: total ? Math.round((sum / total) * 10) / 10 : 0, count: total, distribution };
}

class ReviewService extends BaseService {
  constructor() {
    super(reviewRepository, 'Review');
  }

  async getSummary(productId) {
    const rows = await this.repository.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(String(productId)), status: VISIBLE } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    return summarise(rows);
  }

  /** Public list: approved only, newest first, no customer identifiers beyond the display name. */
  async getProductReviews(productId, { page = 1, limit = 10 } = {}) {
    if (!mongoose.isValidObjectId(productId)) throw new AppError('Invalid product', 400);
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const filter = { product: productId, status: VISIBLE };
    const [rows, summary] = await Promise.all([
      this.repository.model.find(filter).sort('-createdAt').skip((p - 1) * l).limit(l)
        .select('name title rating comment verifiedPurchase reply images createdAt').lean(),
      this.getSummary(productId),
    ]);
    return { reviews: rows, summary, page: p, pages: Math.max(1, Math.ceil(summary.count / l)) };
  }

  /** The order (if any) that proves this customer bought this product. */
  async findPurchase(userId, productId) {
    return Order.findOne({
      user: userId,
      'items.productId': productId,
      orderStatus: { $nin: ['cancelled', 'refunded', 'returned'] },
      $or: [{ 'payment.status': 'paid' }, { orderStatus: 'delivered' }],
    }).select('_id').lean();
  }

  async createReview(user, { productId, rating, title, comment, name }) {
    if (!user) throw new AppError('Please sign in to write a review', 401);
    if (!mongoose.isValidObjectId(productId)) throw new AppError('Invalid product', 400);
    const stars = Number(rating);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new AppError('Rating must be between 1 and 5', 400);

    const product = await productRepository.findById(productId);
    if (!product) throw new AppError('Product not found', 404);

    const text = clean(comment, 2000);
    if (text.length < 5) throw new AppError('Please write a few words about the product', 400);
    if ((text.match(LINKS) || []).length > 1) throw new AppError('Reviews cannot contain links', 400);

    const existing = await this.repository.model.findOne({ product: productId, user: user._id }).select('_id').lean();
    if (existing) throw new AppError('You have already reviewed this product', 409);

    const purchase = await this.findPurchase(user._id, productId);
    try {
      const review = await this.repository.create({
        product: productId,
        user: user._id,
        order: purchase?._id,
        verifiedPurchase: !!purchase,
        name: clean(user.name || name || 'Customer', 60),
        title: clean(title, 120),
        rating: stars,
        comment: text,
        status: 'pending', // always moderated before it is shown
        isApproved: false,
      });
      return review;
    } catch (err) {
      if (err && err.code === 11000) throw new AppError('You have already reviewed this product', 409);
      throw err;
    }
  }

  decorate(reviewDoc) {
    const review = reviewDoc.toObject ? reviewDoc.toObject() : reviewDoc;
    return {
      ...review,
      customerName: review.name || review.user?.name || 'Anonymous',
      customerEmail: review.user?.email || '',
      productName: review.product?.name || '',
      orderNumber: review.order?.orderNumber || '',
    };
  }

  async listAllAdmin(filter = {}) {
    const reviews = await this.repository.find(filter, {
      populate: [{ path: 'product', select: 'name' }, { path: 'user', select: 'name email' }, { path: 'order', select: 'orderNumber' }],
      sort: '-createdAt',
    });
    return reviews.map((r) => this.decorate(r));
  }

  /** Recomputes the product's aggregate rating/review count from approved reviews only. */
  async recomputeProductRating(productId) {
    const id = productId?._id || productId;
    const summary = await this.getSummary(id);
    await productRepository.updateById(id, { rating: summary.average, reviewsCount: summary.count });
    return summary;
  }

  /** Approve / reject / hide / reply. Keeps the legacy isApproved flag in sync and re-rates the product. */
  async updateAdmin(id, payload) {
    const body = {};
    if (payload.status !== undefined) {
      if (!['pending', 'approved', 'rejected', 'hidden'].includes(payload.status)) throw new AppError('Invalid review status', 400);
      body.status = payload.status;
      body.isApproved = payload.status === VISIBLE;
    }
    if (payload.reply !== undefined) body.reply = clean(payload.reply, 1000);
    const review = await this.updateById(id, body);
    await this.recomputeProductRating(review.product);
    return this.decorate(review);
  }

  async approve(id) {
    return this.updateAdmin(id, { status: VISIBLE });
  }

  /** Deleting an approved review must also re-rate the product. */
  async deleteAdmin(id) {
    const review = await this.getById(id);
    await this.deleteById(id);
    await this.recomputeProductRating(review.product);
  }
}

module.exports = new ReviewService();
module.exports.summarise = summarise;
module.exports.clean = clean;
