const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { couponRepository } = require('../repositories');

class CouponService extends BaseService {
  constructor() {
    super(couponRepository, 'Coupon');
  }

  /** Admin sends `status` (bool) + `endDate`; storefront/validity logic uses `isActive` + `expiresAt`. */
  normalize(payload) {
    const body = { ...payload };
    if (typeof body.status === 'boolean') { body.isActive = body.status; delete body.status; }
    if (body.endDate) { body.expiresAt = body.endDate; }
    return body;
  }

  async create(payload) {
    return this.repository.create(this.normalize(payload));
  }

  async updateById(id, payload) {
    return super.updateById(id, this.normalize(payload));
  }

  /** Shared validation + discount math for a coupon code against a subtotal.
   *  Does NOT mutate usedCount/usageHistory — callers decide whether this
   *  check should also consume a usage slot (see `apply` vs `recalculate`). */
  async _check(code, subtotal) {
    if (!code) throw new AppError('Coupon code is required', 400);
    const coupon = await this.repository.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw new AppError('Invalid coupon code', 404);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError('Coupon expired', 400);
    if (coupon.startDate && coupon.startDate > new Date()) throw new AppError('Coupon is not active yet', 400);
    if (subtotal < coupon.minOrderValue) {
      throw new AppError(`Minimum order value ₹${coupon.minOrderValue} required`, 400);
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    let discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(Math.round(discount), subtotal); // never discount more than the order itself

    return { coupon, discount };
  }

  /** Used by the storefront's "Apply Coupon" preview button — validates the
   *  coupon and records a usage. */
  async apply(code, subtotal, user) {
    const { coupon, discount } = await this._check(code, subtotal);

    coupon.usedCount = (coupon.usedCount || 0) + 1;
    coupon.usageHistory = coupon.usageHistory || [];
    coupon.usageHistory.push({ user: user?._id, customerName: user?.name || 'Guest', usedAt: new Date() });
    await coupon.save();

    return { code: coupon.code, discount };
  }

  /** Used server-side at order creation to re-derive the authoritative
   *  discount for the (server-recomputed) subtotal. Never trusts a discount
   *  figure sent by the client. Doesn't touch usedCount/usageHistory again —
   *  that was already recorded when the coupon was applied at checkout. */
  async recalculate(code, subtotal) {
    const { coupon, discount } = await this._check(code, subtotal);
    return { code: coupon.code, discount };
  }

  async listAll() {
    return this.repository.find({}, { sort: '-createdAt' });
  }
}

module.exports = new CouponService();
