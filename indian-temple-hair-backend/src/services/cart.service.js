const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { cartRepository } = require('../repositories');

class CartService extends BaseService {
  constructor() {
    super(cartRepository, 'Cart');
  }

  
  async _populateAndResolve(cart) {
    await cart.populate('items.product');
    // Drop (and save the removal of) rows whose product no longer exists, so the cart never shows blank $0.00 lines.
    const live = cart.items.filter((i) => i.product);
    if (live.length !== cart.items.length) {
      cart.items = live;
      await cart.save();
    }
    const plain = cart.toObject();
    plain.items = plain.items.map((item, idx) => {
      let variant = null;
      try {
        const productDoc = cart.items[idx].product;
        const variants = productDoc?.variants;
        if (item.variant && variants) {
          if (typeof variants.id === 'function') {
            const found = variants.id(item.variant);
            variant = found?.toObject ? found.toObject() : found || null;
          } else if (Array.isArray(variants)) {
            variant = variants.find((v) => String(v._id) === String(item.variant)) || null;
          }
        }
      } catch (err) {
        variant = null;
      }
      return { ...item, variant };
    });
    return plain;
  }

  async getOrCreate(userId) {
    let cart = await this.repository.model.findOne({ user: userId });
    if (!cart) cart = await this.repository.model.create({ user: userId, items: [] });
    return this._populateAndResolve(cart);
  }

  async addItem(userId, productId, variantId = null, qty = 1) {
    let cart = await this.repository.model.findOne({ user: userId });
    if (!cart) cart = new this.repository.model({ user: userId, items: [] });

    // Match on product AND variant — otherwise adding "18 inch" and then
    // "24 inch" of the same product would just bump the qty of whichever
    // variant happened to be added first.
    const existing = cart.items.find(
      (i) => i.product.toString() === productId && String(i.variant || '') === String(variantId || '')
    );
    if (existing) existing.qty += qty;
    else cart.items.push({ product: productId, variant: variantId, qty });

    await cart.save();
    return this._populateAndResolve(cart);
  }

  async updateItem(userId, productId, variantId = null, qty) {
    const cart = await this.repository.model.findOne({ user: userId });
    if (!cart) throw new AppError('Cart not found', 404);
    const item = cart.items.find(
      (i) => i.product.toString() === productId && String(i.variant || '') === String(variantId || '')
    );
    if (!item) throw new AppError('Item not in cart', 404);
    item.qty = Math.max(1, qty);
    await cart.save();
    return this._populateAndResolve(cart);
  }

  async removeItem(userId, productId, variantId = null) {
    const cart = await this.repository.model.findOne({ user: userId });
    if (!cart) throw new AppError('Cart not found', 404);
    cart.items = cart.items.filter(
      (i) => !(i.product.toString() === productId && String(i.variant || '') === String(variantId || ''))
    );
    await cart.save();
    return this._populateAndResolve(cart);
  }
}

module.exports = new CartService();