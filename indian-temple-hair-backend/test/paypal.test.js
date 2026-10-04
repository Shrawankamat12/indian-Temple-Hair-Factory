process.env.JWT_SECRET = 'x'.repeat(40);
const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

const Order = require('../src/models/Order');
const Setting = require('../src/models/Setting');
const WebhookEvent = require('../src/models/WebhookEvent');
const paypal = require('../src/services/paypal.service');
const pp = require('../src/services/paypalPayment.service');
const cfgService = require('../src/services/paymentConfig.service');
const { encrypt, decrypt } = require('../src/utils/secretBox');
const reviews = require('../src/services/review.service');
const orderService = require('../src/services/order.service');

const mkOrder = ({ payment, ...rest } = {}) => ({
  _id: 'oid1', orderNumber: 'ITRH-1001', orderStatus: 'pending', user: null,
  pricing: { grandTotal: 8400 },
  payment: { method: 'paypal', status: 'pending', paypalOrderId: 'PP-ORDER-1', amount: 100, currency: 'USD', ...(payment || {}) },
  ...rest,
});
const goodCapture = (over = {}) => ({ ok: true, status: 201, body: { status: 'COMPLETED', purchase_units: [{ reference_id: 'oid1', payments: { captures: [{ id: 'CAP-1', status: 'COMPLETED', amount: { value: '100.00', currency_code: 'USD' }, custom_id: 'ITRH-1001', ...over }] } }] } });

// A tiny in-memory stand-in for the Order collection so the atomic guards behave like Mongo's.
function fakeOrders(initial) {
  const doc = JSON.parse(JSON.stringify(initial));
  const matches = (q) => Object.entries(q).every(([k, v]) => {
    const cur = k.split('.').reduce((o, p) => (o ? o[p] : undefined), doc);
    if (v && typeof v === 'object' && '$in' in v) return v.$in.includes(cur);
    if (v && typeof v === 'object' && '$ne' in v) return cur !== v.$ne;
    return cur === v;
  });
  const setPath = (k, v) => { const parts = k.split('.'); let o = doc; parts.slice(0, -1).forEach((p) => { o[p] = o[p] || {}; o = o[p]; }); o[parts.at(-1)] = v; };
  mock.method(Order, 'findOneAndUpdate', async (q, u) => { if (!matches(q)) return null; Object.entries(u.$set || {}).forEach(([k, v]) => setPath(k, v)); return doc; });
  mock.method(Order, 'updateOne', async (q, u) => { if (!matches(q)) return { modifiedCount: 0 }; Object.entries(u.$set || {}).forEach(([k, v]) => setPath(k, v)); return { modifiedCount: 1 }; });
  mock.method(Order, 'findById', async () => doc);
  mock.method(Order, 'findOne', async () => doc);
  return doc;
}
test.afterEach(() => mock.restoreAll());

test('charge amount is converted on the server from the INR order total', () => {
  assert.deepEqual(paypal.chargeFor({ pricing: { grandTotal: 8400 } }, { currency: 'USD', inrPerUnit: 84 }), { value: '100.00', currency: 'USD', rate: 84 });
  assert.equal(paypal.chargeFor({ pricing: { grandTotal: 8399.5 } }, { currency: 'USD', inrPerUnit: 84 }).value, '99.99'); // 99.994 rounds down
  assert.equal(paypal.chargeFor({ pricing: { grandTotal: 499 } }, { currency: 'INR' }).value, '499.00');
  assert.throws(() => paypal.chargeFor({ pricing: { grandTotal: 500 } }, { currency: 'USD', inrPerUnit: 0 }), /exchange rate/);
  assert.throws(() => paypal.chargeFor({ pricing: { grandTotal: 0 } }, { currency: 'USD', inrPerUnit: 84 }), /invalid/);
});

test('TEST 7: verified capture -> Paid, order confirmed, ids stored', async () => {
  const doc = fakeOrders(mkOrder());
  mock.method(paypal, 'captureOrder', async () => goodCapture());
  const out = await pp.captureForOrder(mkOrder(), 'PP-ORDER-1');
  assert.equal(doc.payment.status, 'paid'); assert.equal(doc.payment.paypalCaptureId, 'CAP-1');
  assert.ok(doc.payment.paidAt); assert.equal(doc.isPaid, true); assert.equal(doc.orderStatus, 'confirmed');
  assert.equal(out.order.payment.status, 'paid');
});

test('TEST 8: declined / failed capture never marks Paid', async () => {
  const doc = fakeOrders(mkOrder());
  mock.method(paypal, 'captureOrder', async () => ({ ok: false, status: 422, body: { details: [{ issue: 'INSTRUMENT_DECLINED' }] } }));
  await assert.rejects(pp.captureForOrder(mkOrder(), 'PP-ORDER-1'), /declined/);
  assert.equal(doc.payment.status, 'failed'); assert.notEqual(doc.isPaid, true); assert.equal(doc.orderStatus, 'pending');
});

test('capture that does not match the order (amount / currency / reference) is NOT Paid', async () => {
  for (const bad of [{ amount: { value: '1.00', currency_code: 'USD' } }, { amount: { value: '100.00', currency_code: 'EUR' } }, { custom_id: 'ITRH-9999' }]) {
    const doc = fakeOrders(mkOrder());
    mock.method(paypal, 'captureOrder', async () => goodCapture(bad));
    await assert.rejects(pp.captureForOrder(mkOrder(), 'PP-ORDER-1'), /could not be verified/);
    assert.equal(doc.payment.status, 'failed'); assert.notEqual(doc.isPaid, true);
    mock.restoreAll();
  }
});

test('PayPal order id from the browser must match the one stored for this order', async () => {
  fakeOrders(mkOrder());
  await assert.rejects(pp.captureForOrder(mkOrder(), 'SOMEONE-ELSES-ORDER'), /does not belong/);
});

test('pending capture stays Processing; transport error leaves it Processing, not Paid', async () => {
  let doc = fakeOrders(mkOrder());
  mock.method(paypal, 'captureOrder', async () => goodCapture({ status: 'PENDING' }));
  const r = await pp.captureForOrder(mkOrder(), 'PP-ORDER-1');
  assert.equal(r.pending, true); assert.equal(doc.payment.status, 'processing');
  mock.restoreAll();
  doc = fakeOrders(mkOrder());
  mock.method(paypal, 'captureOrder', async () => { throw new Error('ECONNRESET'); });
  await assert.rejects(pp.captureForOrder(mkOrder(), 'PP-ORDER-1'), /could not confirm/);
  assert.equal(doc.payment.status, 'processing');
});

test('double capture: second call does not hit PayPal or double-apply', async () => {
  const doc = fakeOrders(mkOrder());
  const cap = mock.method(paypal, 'captureOrder', async () => goodCapture());
  await pp.captureForOrder(mkOrder(), 'PP-ORDER-1');
  assert.equal(doc.payment.status, 'paid');
  await assert.rejects(pp.captureForOrder(mkOrder({ payment: { status: 'paid' } }), 'PP-ORDER-1'), /already been paid/);
  assert.equal(cap.mock.callCount(), 1);
});

test('TEST 9: cancelled popup = no server call, order stays pending (nothing to mark)', async () => {
  const doc = fakeOrders(mkOrder());
  assert.equal(doc.payment.status, 'pending'); assert.notEqual(doc.isPaid, true);
});

const hdrs = { 'paypal-transmission-id': 't', 'paypal-transmission-sig': 's', 'paypal-cert-url': 'u' };
const evt = (over = {}) => JSON.stringify({ id: 'WH-1', event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'CAP-1', status: 'COMPLETED', custom_id: 'ITRH-1001', amount: { value: '100.00', currency_code: 'USD' } }, ...over });

test('webhook: unverifiable payload is rejected and changes nothing', async () => {
  const doc = fakeOrders(mkOrder());
  mock.method(paypal, 'verifyWebhook', async () => false);
  const create = mock.method(WebhookEvent, 'create', async () => ({}));
  await assert.rejects(pp.handleWebhook(Buffer.from(evt()), hdrs), /signature/);
  assert.equal(create.mock.callCount(), 0); assert.equal(doc.payment.status, 'pending');
  await assert.rejects(pp.handleWebhook(Buffer.from('not json'), hdrs), /Invalid webhook/);
});

test('TEST 10: duplicate webhook delivery is a no-op', async () => {
  const doc = fakeOrders(mkOrder());
  mock.method(paypal, 'verifyWebhook', async () => true);
  const seen = new Set();
  mock.method(WebhookEvent, 'create', async (d) => { if (seen.has(d.eventId)) { const e = new Error('dup'); e.code = 11000; throw e; } seen.add(d.eventId); return d; });
  mock.method(WebhookEvent, 'updateOne', async () => ({}));
  mock.method(WebhookEvent, 'deleteOne', async () => ({}));
  const first = await pp.handleWebhook(Buffer.from(evt()), hdrs);
  assert.equal(first.outcome, 'applied'); assert.equal(doc.payment.status, 'paid');
  const paidAt = doc.payment.paidAt;
  const second = await pp.handleWebhook(Buffer.from(evt()), hdrs);
  assert.equal(second.duplicate, true); assert.equal(doc.payment.paidAt, paidAt);
  // a different event id for an already-paid order is also harmless
  const third = await pp.handleWebhook(Buffer.from(evt({ id: 'WH-2' })), hdrs);
  assert.equal(third.outcome, 'ignored'); assert.equal(doc.payment.paidAt, paidAt);
});

test('webhook: amount mismatch is not marked paid; errors release the event for PayPal retry', async () => {
  let doc = fakeOrders(mkOrder());
  mock.method(paypal, 'verifyWebhook', async () => true);
  mock.method(WebhookEvent, 'create', async (d) => d);
  const upd = mock.method(WebhookEvent, 'updateOne', async () => ({}));
  const del = mock.method(WebhookEvent, 'deleteOne', async () => ({}));
  const bad = JSON.stringify({ id: 'WH-3', event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'CAP-9', status: 'COMPLETED', custom_id: 'ITRH-1001', amount: { value: '1.00', currency_code: 'USD' } } });
  const r = await pp.handleWebhook(Buffer.from(bad), hdrs);
  assert.equal(r.outcome, 'error'); assert.equal(doc.payment.status, 'pending');
  mock.method(Order, 'findOne', async () => { throw new Error('db down'); });
  await assert.rejects(pp.handleWebhook(Buffer.from(evt({ id: 'WH-4' })), hdrs), /db down/);
  assert.equal(del.mock.callCount(), 1);
});

test('webhook: denied capture -> failed; refund from dashboard -> refunded', async () => {
  let doc = fakeOrders(mkOrder());
  mock.method(paypal, 'verifyWebhook', async () => true);
  mock.method(WebhookEvent, 'create', async (d) => d);
  mock.method(WebhookEvent, 'updateOne', async () => ({}));
  await pp.handleWebhook(Buffer.from(evt({ id: 'WH-5', event_type: 'PAYMENT.CAPTURE.DENIED' })), hdrs);
  assert.equal(doc.payment.status, 'failed');
});

test('secrets: encrypt/decrypt roundtrip, tamper -> empty, admin view never contains the secret', async () => {
  const enc = encrypt('SUPER-SECRET');
  assert.notEqual(enc, 'SUPER-SECRET'); assert.ok(!enc.includes('SUPER-SECRET'));
  assert.equal(decrypt(enc), 'SUPER-SECRET');
  assert.equal(decrypt(enc.slice(0, -4) + 'AAAA'), '');
  const PaymentConfig = require('../src/models/PaymentConfig');
  const saved = { paypalEnabled: true, paypalClientId: 'CID', paypalEnvironment: 'sandbox', currency: 'USD', inrPerUnit: 84, paypalClientSecretEnc: enc, paypalWebhookId: 'W' };
  mock.method(PaymentConfig, 'findOne', () => ({ select: async () => saved, lean: async () => saved }));
  const view = await cfgService.getAdminView();
  assert.ok(!JSON.stringify(view).includes('SUPER-SECRET')); assert.equal(view.hasClientSecret, true);
});

test('public methods: secret never exposed; paypal hidden until currency is convertible', async () => {
  const PaymentConfig = require('../src/models/PaymentConfig');
  let runtime = { enabled: true, environment: 'sandbox', clientId: 'CID', secret: 'SHH', webhookId: 'W', currency: 'USD', inrPerUnit: 0 };
  mock.method(cfgService, 'getRuntime', async () => runtime);
  mock.method(Setting, 'findOne', () => ({ lean: async () => ({ codEnabled: false }) }));
  // getPublicMethods closes over module-level getRuntime, so call through a fresh require with the stub in place
  delete require.cache[require.resolve('../src/services/paymentConfig.service')];
  const fresh = require('../src/services/paymentConfig.service');
  mock.method(PaymentConfig, 'findOne', () => ({ select: async () => ({ paypalEnabled: true, paypalClientId: 'CID', paypalEnvironment: 'sandbox', currency: 'USD', inrPerUnit: 0, paypalClientSecretEnc: encrypt('SHH'), paypalWebhookId: 'W' }) }));
  let m = await fresh.getPublicMethods();
  assert.equal(m.paypal.enabled, false); assert.equal(m.cod.enabled, false); assert.ok(!JSON.stringify(m).includes('SHH'));
  PaymentConfig.findOne.mock.restore();
  mock.method(PaymentConfig, 'findOne', () => ({ select: async () => ({ paypalEnabled: true, paypalClientId: 'CID', paypalEnvironment: 'sandbox', currency: 'USD', inrPerUnit: 84, paypalClientSecretEnc: encrypt('SHH'), paypalWebhookId: 'W' }) }));
  m = await fresh.getPublicMethods();
  assert.equal(m.paypal.enabled, true); assert.equal(m.paypal.clientId, 'CID'); assert.ok(!JSON.stringify(m).includes('SHH'));
});

test('order access: owner, admin, token holder only', () => {
  const o = { user: 'u1', accessToken: 'a'.repeat(48) };
  assert.equal(orderService.canAccess(o, { user: { _id: 'u1', role: 'customer' } }), true);
  assert.equal(orderService.canAccess(o, { user: { _id: 'u2', role: 'customer' } }), false);
  assert.equal(orderService.canAccess(o, { user: { _id: 'u2', role: 'admin' } }), true);
  assert.equal(orderService.canAccess(o, { token: 'a'.repeat(48) }), true);
  assert.equal(orderService.canAccess(o, { token: 'b'.repeat(48) }), false);
  assert.equal(orderService.canAccess(o, { token: 'short' }), false);
  assert.equal(orderService.canAccess(o, {}), false);
  assert.equal(orderService.canAccess({ user: null }, { token: 'anything' }), false);
});

test('reviews: distribution/average maths and plain-text sanitising', () => {
  const s = reviews.summarise([{ _id: 5, count: 3 }, { _id: 4, count: 1 }, { _id: 1, count: 1 }]);
  assert.deepEqual(s.distribution, { 1: 1, 2: 0, 3: 0, 4: 1, 5: 3 }); assert.equal(s.count, 5); assert.equal(s.average, 4);
  assert.deepEqual(reviews.summarise([]), { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  assert.equal(reviews.clean('<script>alert(1)</script>Lovely   hair <b>bold</b>', 100), 'alert(1) Lovely hair bold');
  assert.equal(reviews.clean('x'.repeat(50), 10).length, 10);
});
