const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { orderRepository, productRepository } = require('../repositories');
const generateOrderNumber = require('../utils/generateOrderNumber');
const couponService = require('./coupon.service');
const paymentConfigService = require('./paymentConfig.service');
const Product = require('../models/Product');
const Setting = require('../models/Setting');
const { priceLine, computeTotals } = require('./pricing.service');
const mongoose = require('mongoose');
const crypto = require('crypto');

class OrderService extends BaseService {
  constructor() {
    super(orderRepository, 'Order');
  }

  async createOrder(user, payload) {
    const { items, billingAddress, shippingAddress, couponCode, orderSource = 'Website' } = payload;

    // The storefront checkout sends payment method / shipping method as nested objects
    // ({ payment: { method }, shipping: { method } }) rather than flat fields — accept both shapes.
    const paymentMethod = payload.paymentMethod || payload.payment?.method || 'paypal';
    const shippingMethod = payload.shippingMethod || payload.shipping?.method || 'standard';

    if (!Array.isArray(items) || items.length === 0) throw new AppError('Order must contain at least one item', 400);

    // Only methods the business has actually enabled may be used (PayPal / COD); legacy gateway names are rejected.
    const methods = await paymentConfigService.getPublicMethods();
    if (paymentMethod === 'paypal' && !methods.paypal.enabled) throw new AppError('PayPal payment is not available right now', 400);
    if (paymentMethod === 'cod' && !methods.cod.enabled) throw new AppError('Cash on delivery is not available', 400);
    if (!['paypal', 'cod'].includes(paymentMethod)) throw new AppError('Please choose an available payment method', 400);

    // --- Re-derive every line from the live Product record (price, variant, stock). The client only supplies
    // productId, which variant, and quantity. ---
    const lines = [];
    for (const i of items) {
      const productId = i.productId || i.product;
      if (!productId || !mongoose.isValidObjectId(productId)) throw new AppError('Each item needs a productId', 400);
      const product = await productRepository.findById(productId);
      lines.push(priceLine(product, i));
    }
    // Merge duplicate product+variant lines so the stock check below sees the combined quantity.
    const merged = [];
    for (const l of lines) {
      const hit = merged.find((m) => String(m.productId) === String(l.productId) && String(m.variantId || '') === String(l.variantId || ''));
      if (hit) { hit.quantity += l.quantity; hit.total = Math.round(hit.finalPrice * hit.quantity * 100) / 100; } else merged.push({ ...l });
    }

    const setting = await Setting.findOne().lean();
    const pre = computeTotals(merged, { setting, shippingMethod });

    // Coupon is re-validated and re-priced server-side against the selling subtotal.
    let couponDiscount = 0;
    let appliedCouponCode;
    if (couponCode) {
      const result = await couponService.recalculate(couponCode, pre.sellingSubtotal);
      couponDiscount = result.discount;
      appliedCouponCode = result.code;
    }
    const totals = computeTotals(merged, { setting, shippingMethod, couponDiscount });

    // Atomically reserve stock first; if the order can't be saved, give it back.
    const reserved = await this.reserveStock(merged);
    let order;
    try {
      const accessToken = crypto.randomBytes(24).toString('hex');
      order = await this.repository.create({
        user: user?._id || null,
        isGuest: !user,
        customerName: user?.name || shippingAddress?.fullName,
        customerEmail: user?.email || shippingAddress?.email,
        customerPhone: user?.phone || shippingAddress?.phone,
        orderNumber: generateOrderNumber(),
        orderSource,
        orderStatus: 'pending',
        items: merged,
        billingAddress: billingAddress || shippingAddress,
        shippingAddress,
        pricing: {
          subtotal: totals.subtotal,
          productDiscount: totals.productDiscount,
          couponCode: appliedCouponCode,
          couponDiscount: totals.couponDiscount,
          shippingCharge: totals.shippingCharge,
          tax: totals.tax,
          grandTotal: totals.grandTotal,
        },
        payment: { method: paymentMethod, status: 'pending' },
        shipping: { method: shippingMethod },
        customerNote: payload.customerNote,
        isCOD: paymentMethod === 'cod',
        accessToken,
      });
    } catch (err) {
      await this.releaseStock(reserved);
      throw err;
    }

    // The access token is handed back exactly once, to whoever placed the order.
    const out = order.toObject();
    out.accessToken = order.accessToken;
    return out;
  }

  /** Atomic, conditional stock decrement (never goes below zero, never oversells under concurrency). */
  async reserveStock(lines) {
    const done = [];
    try {
      for (const l of lines) {
        if (l.variantId) {
          const r = await Product.updateOne(
            { _id: l.productId, variants: { $elemMatch: { _id: l.variantId, stock: { $gte: l.quantity } } } },
            { $inc: { 'variants.$.stock': -l.quantity } }
          );
          if (!r.modifiedCount) throw new AppError(`"${l.productName}" just sold out, please review your cart`, 409);
          done.push(l);
          await Product.updateOne({ _id: l.productId, stock: { $gte: l.quantity } }, { $inc: { stock: -l.quantity } }); // keep the aggregate in step when it is tracked
        } else {
          const r = await Product.updateOne({ _id: l.productId, stock: { $gte: l.quantity } }, { $inc: { stock: -l.quantity } });
          if (!r.modifiedCount) throw new AppError(`"${l.productName}" just sold out, please review your cart`, 409);
          done.push(l);
        }
      }
    } catch (err) {
      await this.releaseStock(done);
      throw err;
    }
    return done;
  }

  async releaseStock(lines) {
    for (const l of lines) {
      if (l.variantId) {
        await Product.updateOne({ _id: l.productId, 'variants._id': l.variantId }, { $inc: { 'variants.$.stock': l.quantity } }).catch(() => {});
      }
      await Product.updateOne({ _id: l.productId }, { $inc: { stock: l.quantity } }).catch(() => {});
    }
  }

  /** Who may read / pay for an order: staff, the owning customer, or the holder of the checkout access token. */
  canAccess(order, { user, token } = {}) {
    if (user && (user.role === 'admin' || user.role === 'staff')) return true;
    if (user && order.user && String(order.user._id || order.user) === String(user._id)) return true;
    const stored = order.accessToken;
    if (token && stored && token.length === stored.length) {
      return crypto.timingSafeEqual(Buffer.from(String(token)), Buffer.from(String(stored)));
    }
    return false;
  }

  /** Loads an order for a payment call and enforces ownership. */
  async getForCustomer(idOrNumber, ctx) {
    const isId = mongoose.isValidObjectId(idOrNumber);
    const order = await this.repository.model
      .findOne(isId ? { _id: idOrNumber } : { orderNumber: String(idOrNumber) })
      .select('+accessToken');
    if (!order || !this.canAccess(order, ctx)) throw new AppError('Order not found', 404); // same answer either way: don't reveal which order numbers exist
    return order;
  }

  async getMyOrders(userId) {
    return this.repository.find({ user: userId }, { sort: '-createdAt' });
  }

  async getByIdOrOrderNumber(idOrNumber) {
    const filter = mongoose.isValidObjectId(idOrNumber) ? { $or: [{ _id: idOrNumber }, { orderNumber: idOrNumber }] } : { orderNumber: idOrNumber };
    const order = await this.repository.findOne(filter);
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  /** Adds the fields the admin panel's Order Details/Invoice/Packing Slip/Shipping
   *  Label pages read directly (customerName/email/phone/timeline/shippingFee/discount)
   *  without renaming anything on the stored document. */
  decorate(orderDoc) {
    const order = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
    const addr = order.shippingAddress || {};
    const pricing = order.pricing || {};
    return {
      ...order,
      customerName: order.user?.name || order.customerName || addr.fullName || 'Guest',
      email: order.user?.email || order.customerEmail || addr.email || '',
      phone: order.user?.phone || order.customerPhone || addr.phone || '',
      itemsCount: order.items?.length || 0,
      shippingFee: pricing.shippingCharge || 0,
      discount: (pricing.productDiscount || 0) + (pricing.couponDiscount || 0),
      timeline: order.statusHistory?.length
        ? order.statusHistory
        : [{ status: order.orderStatus, at: order.createdAt }],
    };
  }

  async listAll(status) {
    const filter = status ? { orderStatus: status } : {};
    const orders = await this.repository.find(filter, { sort: '-createdAt', populate: { path: 'user', select: 'name email phone' } });
    return orders.map((o) => this.decorate(o));
  }

  async getByIdAdmin(id) {
    const order = await this.repository.findById(id, { populate: { path: 'user', select: 'name email phone' } });
    if (!order) throw new AppError('Order not found', 404);
    return this.decorate(order);
  }

  async updateStatus(id, { status, orderStatus, trackingNumber, trackingId, paymentStatus }) {
    const order = await this.repository.model.findById(id);
    if (!order) throw new AppError('Order not found', 404);

    if (orderStatus || status) order.orderStatus = orderStatus || status;
    if (trackingNumber || trackingId) {
      order.shipping = order.shipping || {};
      order.shipping.trackingNumber = trackingNumber || trackingId;
    }
    if (paymentStatus) {
      order.payment = order.payment || {};
      order.payment.status = paymentStatus;
      order.isPaid = paymentStatus === 'paid';
      if (paymentStatus === 'paid' && !order.payment.paidAt) order.payment.paidAt = new Date();
    }

    await order.save(); // triggers the pre('save') hook that appends to statusHistory
    return this.decorate(order);
  }

  /** Generic partial update used by shipOrder — shallow-merges nested
   *  objects (e.g. shipping, payment) instead of overwriting them. */
  async updateById(id, data) {
    const order = await this.repository.model.findById(id);
    if (!order) throw new AppError('Order not found', 404);

    Object.entries(data).forEach(([key, value]) => {
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        order[key] &&
        typeof order[key] === 'object'
      ) {
        order[key] = { ...(order[key].toObject?.() ?? order[key]), ...value };
      } else {
        order[key] = value;
      }
    });

    await order.save();
    return this.decorate(order);
  }
}

module.exports = new OrderService();