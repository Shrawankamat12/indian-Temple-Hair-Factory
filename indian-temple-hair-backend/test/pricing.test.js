process.env.JWT_SECRET = 'x'.repeat(40);
const test = require('node:test');
const assert = require('node:assert/strict');
const { priceLine, computeTotals, shippingConfig } = require('../src/services/pricing.service');

const oid = (n) => n.toString(16).padStart(24, '0');
const product = (over = {}) => ({
  _id: oid(1), name: 'Temple Wavy', sku: 'TW', isActive: true, visibility: 'visible',
  mrp: 12000, price: 10000, stock: 5, hasVariants: false, variants: [], ...over,
});
const withVariants = () => product({
  hasVariants: true,
  variants: [
    { _id: oid(11), length: '18', colour: 'Natural', sku: 'TW-18', price: 10000, stock: 2 },
    { _id: oid(12), length: '24', colour: 'Natural', sku: 'TW-24', price: 16000, stock: 1 },
  ],
});

test('client-sent prices are ignored: DB price is used', () => {
  const l = priceLine(product(), { productId: oid(1), quantity: 2, unitPrice: 1, finalPrice: 1, price: 1, total: 2 });
  assert.equal(l.finalPrice, 10000); assert.equal(l.unitPrice, 12000); assert.equal(l.discount, 2000); assert.equal(l.total, 20000);
});

test('variant price is used (by id, by sku, by attributes)', () => {
  const p = withVariants();
  assert.equal(priceLine(p, { variantId: oid(12), quantity: 1 }).finalPrice, 16000);
  assert.equal(priceLine(p, { variant: { sku: 'TW-24' }, quantity: 1 }).finalPrice, 16000);
  assert.equal(priceLine(p, { variant: { length: '24 inch' }, quantity: 1 }).finalPrice, 16000);
  assert.equal(priceLine(p, { variantId: oid(11), quantity: 1 }).unitPrice, 12000); // keeps MRP strike-through when variant sells at product price
});

test('variant product without a resolvable choice is rejected', () => {
  assert.throws(() => priceLine(withVariants(), { quantity: 1 }), /valid option/);
  assert.throws(() => priceLine(withVariants(), { variant: { colour: 'Natural' }, quantity: 1 }), /valid option/); // ambiguous
});

test('variant stock is enforced, not product stock', () => {
  const p = withVariants(); // product.stock 5 but variant 12 has 1
  assert.throws(() => priceLine(p, { variantId: oid(12), quantity: 2 }), /Only 1 unit/);
});

test('inactive / hidden / out-of-stock / bad quantity', () => {
  assert.throws(() => priceLine(product({ isActive: false }), { quantity: 1 }), /unavailable/);
  assert.throws(() => priceLine(product({ visibility: 'hidden' }), { quantity: 1 }), /unavailable/);
  assert.throws(() => priceLine(product({ stock: 0 }), { quantity: 1 }), /out of stock/);
  assert.throws(() => priceLine(product(), { quantity: 0 }), /Invalid quantity/);
  assert.throws(() => priceLine(product(), { quantity: 'abc' }), /Invalid quantity/);
  assert.throws(() => priceLine(null, { quantity: 1 }), /no longer exists/);
});

test('shipping comes from settings, with USD built-ins as defaults', () => {
  const line = priceLine(product({ mrp: 100, price: 100 }), { quantity: 1 });
  assert.equal(computeTotals([line], {}).shippingCharge, 15);
  assert.equal(computeTotals([line], { shippingMethod: 'express' }).shippingCharge, 35);
  assert.equal(computeTotals([line], { setting: { flatShippingRate: 250, expressShippingRate: 700 } }).shippingCharge, 250);
  assert.equal(computeTotals([line], { shippingMethod: 'express', setting: { expressShippingRate: 700 } }).shippingCharge, 700);
  const big = priceLine(product({ mrp: 250, price: 250 }), { quantity: 1 });
  assert.equal(computeTotals([big], {}).shippingCharge, 0); // > $200 default threshold
  assert.equal(computeTotals([big], { setting: { freeShippingThreshold: 300 } }).shippingCharge, 15);
  assert.equal(computeTotals([big], { setting: { freeShippingThreshold: 0 } }).shippingCharge, 15); // 0 disables free shipping
});

test('grand total = selling subtotal - coupon + shipping + tax, rounded to 2dp', () => {
  const line = priceLine(product({ mrp: 1000, price: 800 }), { quantity: 3 });
  const t = computeTotals([line], { couponDiscount: 100, setting: { taxRate: 5, freeShippingThreshold: 0 } });
  assert.equal(t.subtotal, 3000); assert.equal(t.productDiscount, 600);
  assert.equal(t.tax, 115); // 5% of (2400-100)
  assert.equal(t.grandTotal, 2300 + 15 + 115);
  assert.equal(shippingConfig({}).taxRate, 0);
});
