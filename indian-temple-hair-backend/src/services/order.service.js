const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { orderRepository, productRepository } = require('../repositories');
const generateOrderNumber = require('../utils/generateOrderNumber');
const couponService = require('./coupon.service');
const inventoryService = require('./inventory.service');

class OrderService extends BaseService {
  constructor() {
    super(orderRepository, 'Order');
  }

  async createOrder(user, payload) {
    const {
      items,
      billingAddress,
      shippingAddress,
      couponCode,
      orderSource = 'Website',
    } = payload;

    // The storefront checkout sends payment method / shipping method as
    // nested objects ({ payment: { method }, shipping: { method } }) rather
    // than flat paymentMethod/shippingMethod fields — accept both shapes.
    const paymentMethod = payload.paymentMethod || payload.payment?.method;
    const shippingMethod = payload.shippingMethod || payload.shipping?.method;

    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Order must contain at least one item', 400);
    }

    // --- Re-derive every line item from the live Product record. The client
    // only supplies productId, the descriptive variant snapshot, and the
    // requested quantity — price, discount and totals are never trusted from
    // the request body, they're recomputed here from the database. This also
    // revalidates that each product still exists, is active, and has enough
    // stock before the order is allowed to be placed. ---
    const processedItems = await Promise.all(
      items.map(async (i) => {
        const productId = i.productId || i.product;
        if (!productId) throw new AppError('Each item needs a productId', 400);

        const product = await productRepository.findById(productId);
        if (!product) throw new AppError(`A product in your cart no longer exists`, 400);
        if (!product.isActive) throw new AppError(`"${product.name}" is currently unavailable`, 400);

        const quantity = Math.max(1, Math.floor(Number(i.quantity ?? i.qty ?? 1)));
        if (!Number.isFinite(quantity) || quantity < 1) {
          throw new AppError(`Invalid quantity for "${product.name}"`, 400);
        }
        if ((product.stock || 0) < quantity) {
          throw new AppError(
            `Only ${product.stock || 0} unit(s) of "${product.name}" left in stock`,
            409
          );
        }

        // unitPrice = pre-discount price (MRP), discount = per-unit discount,
        // finalPrice = actual selling price (product.price is always the
        // authoritative selling price — see product.service.js normalize()).
        const unitPrice = product.mrp ?? product.price;
        const finalPrice = product.price;
        const discount = Math.max(0, unitPrice - finalPrice);

        return {
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          image: product.images?.[0],
          variant:
            i.variant && typeof i.variant === 'object'
              ? {
                  length: i.variant.length,
                  colour: i.variant.colour,
                  texture: i.variant.texture,
                  weight: i.variant.weight,
                  density: i.variant.density,
                  sku: i.variant.sku,
                }
              : undefined,
          quantity,
          unitPrice,
          discount,
          finalPrice,
          total: finalPrice * quantity,
        };
      })
    );

    const subtotal = processedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const productDiscount = processedItems.reduce((sum, i) => sum + i.discount * i.quantity, 0);

    // Coupon: re-validated and re-priced server-side against the recomputed
    // subtotal (expiry/usage-limit/min-order-value all checked again here) —
    // never trust a couponDiscount figure sent by the client.
    let couponDiscount = 0;
    let appliedCouponCode;
    if (couponCode) {
      const result = await couponService.recalculate(couponCode, subtotal);
      couponDiscount = result.discount;
      appliedCouponCode = result.code;
    }

    const shippingCharge = shippingMethod === 'express' ? 999 : subtotal > 15000 ? 0 : 499;
    const grandTotal = Math.max(0, subtotal - productDiscount - couponDiscount + shippingCharge);

    const order = await this.repository.create({
      user: user?._id || null,
      isGuest: !user,
      customerName: user?.name || shippingAddress?.fullName,
      customerEmail: user?.email || shippingAddress?.email,
      customerPhone: user?.phone || shippingAddress?.phone,

      orderNumber: generateOrderNumber(),
      orderSource,
      orderStatus: 'pending',

      items: processedItems,

      billingAddress: billingAddress || shippingAddress,
      shippingAddress,

      pricing: {
        subtotal,
        productDiscount,
        couponCode: appliedCouponCode,
        couponDiscount,
        shippingCharge,
        tax: 0,
        grandTotal,
      },

      payment: {
        method: paymentMethod || 'card',
        status: 'pending',
      },

      shipping: {
        method: shippingMethod || 'standard',
      },

      isCOD: paymentMethod === 'cod',
    });

    // Reserve stock immediately so two customers can't both check out the
    // last unit while one of them is still on the payment screen. Best-effort
    // (not run inside a DB transaction, consistent with the rest of this
    // codebase's inventory handling) — logged the same way admin adjustments are.
    await Promise.all(
      processedItems.map((i) =>
        inventoryService
          .adjust(i.productId, { delta: -i.quantity, reason: 'order' }, user?._id)
          .catch(() => {})
      )
    );

    return order;
  }

  async getMyOrders(userId) {
    return this.repository.find({ user: userId }, { sort: '-createdAt' });
  }

  async getByIdOrOrderNumber(idOrNumber) {
    const order = await this.repository.findOne({ $or: [{ _id: idOrNumber }, { orderNumber: idOrNumber }] });
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