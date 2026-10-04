const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

// Server-side source of truth for what an order costs. Nothing in here trusts a price, discount, shipping
// figure or total from the browser: only productId / variant choice / quantity are read from the request.

const DEFAULTS = { freeShippingThreshold: 15000, flatShippingRate: 499, expressShippingRate: 999 };
const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const num = (v, d) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? d : Number(v));

/** Shipping/tax configuration from the Setting singleton, falling back to the previous built-in values. */
function shippingConfig(setting = {}) {
  return {
    freeShippingThreshold: num(setting.freeShippingThreshold, DEFAULTS.freeShippingThreshold), // <= 0 disables free shipping
    standardRate: num(setting.flatShippingRate, DEFAULTS.flatShippingRate),
    expressRate: num(setting.expressShippingRate, DEFAULTS.expressShippingRate),
    taxRate: Math.max(0, num(setting.taxRate, 0)),
    taxLabel: setting.taxLabel || 'Tax',
  };
}

const VARIANT_ATTRS = ['length', 'colour', 'texture', 'weight', 'density', 'laceType'];
const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s*(inch|in|")$/i, '');

/** Finds the variant the shopper chose: by id, then SKU, then a unique match on the option attributes they sent. */
function resolveVariant(product, item) {
  const variants = (product.variants || []).filter((v) => v.isActive !== false); // inactive variants cannot be sold
  if (!product.hasVariants || variants.length === 0) return null;

  const id = item.variantId || item.variant?.id || item.variant?._id;
  if (id && mongoose.isValidObjectId(id)) {
    const hit = variants.find((v) => String(v._id) === String(id));
    if (hit) return hit;
  }
  const sku = item.variantSku || item.variant?.sku;
  if (sku) {
    const hit = variants.find((v) => v.sku && String(v.sku) === String(sku));
    if (hit) return hit;
  }
  const given = item.variant && typeof item.variant === 'object' ? item.variant : {};
  const wanted = VARIANT_ATTRS.filter((k) => given[k] !== undefined && given[k] !== '' && given[k] !== null);
  if (wanted.length) {
    const matches = variants.filter((v) => wanted.every((k) => norm(v[k]) === norm(given[k])));
    if (matches.length === 1) return matches[0];
  }
  throw new AppError(`Please choose a valid option for "${product.name}"`, 400);
}

/** Prices one cart line from the live product record. Throws AppError for anything that cannot be sold. */
function priceLine(product, item) {
  if (!product) throw new AppError('A product in your cart no longer exists', 400);
  if (!product.isActive || product.visibility === 'hidden') throw new AppError(`"${product.name}" is currently unavailable`, 400);

  const quantity = Math.floor(Number(item.quantity ?? item.qty ?? 1));
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 1000) throw new AppError(`Invalid quantity for "${product.name}"`, 400);

  const variant = resolveVariant(product, item);
  const available = variant ? num(variant.stock, 0) : num(product.stock, 0);
  if (available < quantity) {
    throw new AppError(available > 0 ? `Only ${available} unit(s) of "${product.name}" left in stock` : `"${product.name}" is out of stock`, 409);
  }

  const finalPrice = variant && variant.price != null ? num(variant.price, product.price) : num(product.price, 0);
  if (!(finalPrice >= 0)) throw new AppError(`"${product.name}" has no valid price`, 400);
  // The list price (MRP) only applies when the variant sells at the product's own selling price.
  const mrp = num(product.mrp, finalPrice);
  const unitPrice = !variant || finalPrice === num(product.price, finalPrice) ? Math.max(mrp, finalPrice) : finalPrice;
  const discount = r2(Math.max(0, unitPrice - finalPrice));

  return {
    productId: product._id,
    variantId: variant ? variant._id : undefined,
    productName: product.name,
    sku: variant?.sku || product.sku,
    image: product.images?.[0] || product.gallery?.[0]?.url,
    variant: variant
      ? { length: variant.length, colour: variant.colour, texture: variant.texture, weight: variant.weight, density: variant.density, laceType: variant.laceType, sku: variant.sku }
      : undefined,
    quantity,
    unitPrice: r2(unitPrice),
    discount,
    finalPrice: r2(finalPrice),
    total: r2(finalPrice * quantity),
  };
}

/** Pure totals calculation. `couponDiscount` must already have been validated server-side. */
function computeTotals(lines, { setting, shippingMethod = 'standard', couponDiscount = 0 } = {}) {
  const cfg = shippingConfig(setting);
  const subtotal = r2(lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0));
  const productDiscount = r2(lines.reduce((s, l) => s + l.discount * l.quantity, 0));
  const selling = r2(subtotal - productDiscount);

  let shippingCharge;
  if (shippingMethod === 'express') shippingCharge = cfg.expressRate;
  else shippingCharge = cfg.freeShippingThreshold > 0 && selling > cfg.freeShippingThreshold ? 0 : cfg.standardRate;

  const taxable = Math.max(0, selling - couponDiscount);
  const tax = cfg.taxRate > 0 ? r2((taxable * cfg.taxRate) / 100) : 0;
  const grandTotal = r2(Math.max(0, taxable + shippingCharge + tax));
  return { subtotal, productDiscount, couponDiscount: r2(couponDiscount), shippingCharge: r2(shippingCharge), tax, grandTotal, sellingSubtotal: selling };
}

module.exports = { priceLine, resolveVariant, computeTotals, shippingConfig, DEFAULTS };
