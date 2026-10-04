const AppError = require('../utils/AppError');
const paymentConfig = require('./paymentConfig.service');

// Minimal PayPal REST client (Orders v2 + webhook verification) using the platform fetch.
// Everything here runs on the server; credentials come from paymentConfig.getRuntime().
const tokenCache = new Map(); // key: clientId|env -> { token, exp }

async function callPayPal(cfg, path, { method = 'GET', body, headers = {}, auth = 'bearer' } = {}) {
  const res = await fetch(`${cfg.apiBase}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth === 'basic'
        ? `Basic ${Buffer.from(`${cfg.clientId}:${cfg.secret}`).toString('base64')}`
        : `Bearer ${await getAccessToken(cfg)}`,
      ...headers,
    },
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, json };
}

async function getAccessToken(cfg) {
  const k = `${cfg.clientId}|${cfg.environment}`;
  const hit = tokenCache.get(k);
  if (hit && hit.exp > Date.now() + 30000) return hit.token;
  const res = await fetch(`${cfg.apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${cfg.clientId}:${cfg.secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) throw new AppError('Could not authenticate with PayPal. Please contact support.', 502);
  tokenCache.set(k, { token: json.access_token, exp: Date.now() + (json.expires_in || 300) * 1000 });
  return json.access_token;
}

// Zero-decimal currencies must not carry fractional digits in the PayPal API.
const ZERO_DECIMAL = new Set(['JPY', 'HUF', 'TWD']);
const fmt = (n, currency) => (ZERO_DECIMAL.has(currency) ? String(Math.round(n)) : (Math.round(n * 100) / 100).toFixed(2));

/**
 * Converts the order's INR grand total into the PayPal charge amount. This is the only place the charge amount
 * is derived, and it is derived from the stored (server-priced) order, never from anything the browser sends.
 */
function chargeFor(order, cfg) {
  const inr = Number(order.pricing?.grandTotal);
  if (!Number.isFinite(inr) || inr <= 0) throw new AppError('Order total is invalid', 400);
  if (cfg.currency === 'INR') return { value: fmt(inr, 'INR'), currency: 'INR', rate: null };
  if (!(cfg.inrPerUnit > 0)) throw new AppError('PayPal is not fully configured (exchange rate missing).', 503);
  return { value: fmt(inr / cfg.inrPerUnit, cfg.currency), currency: cfg.currency, rate: cfg.inrPerUnit };
}

async function createOrder(order, { returnUrl, cancelUrl, brandName } = {}) {
  const cfg = await paymentConfig.getRuntime();
  if (!cfg.enabled) throw new AppError('PayPal is not available right now.', 503);
  const charge = chargeFor(order, cfg);
  const { ok, status, json } = await callPayPal(cfg, '/v2/checkout/orders', {
    method: 'POST',
    headers: { 'PayPal-Request-Id': `itrh-${order.orderNumber}-${order.payment?.paypalOrderId ? Date.now() : 'first'}` },
    body: {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: String(order._id),
        custom_id: order.orderNumber,
        invoice_id: order.orderNumber,
        description: `Order ${order.orderNumber}`.slice(0, 127),
        amount: { currency_code: charge.currency, value: charge.value },
      }],
      application_context: {
        brand_name: brandName || undefined,
        shipping_preference: 'NO_SHIPPING', // address is collected by our own checkout
        user_action: 'PAY_NOW',
        return_url: returnUrl, cancel_url: cancelUrl,
      },
    },
  });
  if (!ok || !json?.id) throw new AppError(`PayPal could not create the order (${json?.name || status}).`, 502);
  return { paypalOrderId: json.id, charge };
}

async function captureOrder(paypalOrderId) {
  const cfg = await paymentConfig.getRuntime();
  if (!cfg.enabled) throw new AppError('PayPal is not available right now.', 503);
  const { ok, status, json } = await callPayPal(cfg, `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST', headers: { 'PayPal-Request-Id': `capture-${paypalOrderId}` }, body: '{}',
  });
  return { ok, status, body: json };
}

/** Flattens a PayPal capture response into what we need to verify. */
function readCapture(body) {
  const unit = body?.purchase_units?.[0];
  const cap = unit?.payments?.captures?.[0];
  return {
    orderStatus: body?.status,
    captureId: cap?.id,
    captureStatus: cap?.status,
    value: cap?.amount?.value,
    currency: cap?.amount?.currency_code,
    customId: cap?.custom_id || unit?.custom_id,
    referenceId: unit?.reference_id,
  };
}

/** Verifies a webhook with PayPal's own verification endpoint. Returns true only on SUCCESS. */
async function verifyWebhook(headers, event) {
  const cfg = await paymentConfig.getRuntime();
  if (!cfg.enabled || !cfg.webhookId) return false;
  const h = (n) => headers[n];
  if (!h('paypal-transmission-id') || !h('paypal-transmission-sig') || !h('paypal-cert-url')) return false;
  const { ok, json } = await callPayPal(cfg, '/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: {
      auth_algo: h('paypal-auth-algo'),
      cert_url: h('paypal-cert-url'),
      transmission_id: h('paypal-transmission-id'),
      transmission_sig: h('paypal-transmission-sig'),
      transmission_time: h('paypal-transmission-time'),
      webhook_id: cfg.webhookId,
      webhook_event: event,
    },
  });
  return ok && json?.verification_status === 'SUCCESS';
}

module.exports = { createOrder, captureOrder, readCapture, verifyWebhook, chargeFor };
