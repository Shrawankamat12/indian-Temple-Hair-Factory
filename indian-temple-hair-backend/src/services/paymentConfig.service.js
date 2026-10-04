const PaymentConfig = require('../models/PaymentConfig');
const Setting = require('../models/Setting');
const { encrypt, decrypt } = require('../utils/secretBox');

const env = (k) => (process.env[k] || '').trim();

/**
 * Resolves the PayPal settings actually in force. Admin-saved values win; environment variables
 * (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_ENVIRONMENT / PAYPAL_WEBHOOK_ID) are the fallback.
 * The returned object contains the secret and must only be used server-side.
 */
async function getRuntime() {
  const doc = await PaymentConfig.findOne().select('+paypalClientSecretEnc');
  const secret = (doc && decrypt(doc.paypalClientSecretEnc)) || env('PAYPAL_CLIENT_SECRET');
  const clientId = (doc && doc.paypalClientId) || env('PAYPAL_CLIENT_ID');
  const environment = (doc && doc.paypalEnvironment) || env('PAYPAL_ENVIRONMENT') || 'sandbox';
  const webhookId = (doc && doc.paypalWebhookId) || env('PAYPAL_WEBHOOK_ID');
  // With no saved document, PayPal is enabled as soon as env credentials exist; once an admin has saved the
  // Payments form, their on/off switch is authoritative.
  const enabled = doc ? !!doc.paypalEnabled : !!(clientId && secret);
  // The store sells in US dollars only; PayPal always charges USD.
  const currency = 'USD';
  return {
    enabled: enabled && !!clientId && !!secret,
    environment: environment === 'live' ? 'live' : 'sandbox',
    clientId, secret, webhookId, currency,
    apiBase: environment === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com',
  };
}

/** Safe for the admin UI: secrets are reported as booleans only. */
async function getAdminView() {
  const r = await getRuntime();
  const doc = await PaymentConfig.findOne().lean();
  const problems = [];
  const switchedOn = doc ? !!doc.paypalEnabled : !!(r.clientId && r.secret);
  if (!switchedOn) problems.push('PayPal is switched off, so it is hidden on checkout.');
  if (!r.clientId) problems.push('PayPal Client ID is missing.');
  if (!r.secret) problems.push('PayPal Client Secret is missing.');
  return {
    paypalReady: problems.length === 0,
    problems,
    paypalEnabled: doc ? !!doc.paypalEnabled : r.enabled,
    paypalEnvironment: r.environment,
    paypalClientId: r.clientId,
    hasClientSecret: !!r.secret,
    paypalWebhookId: r.webhookId,
    hasWebhookId: !!r.webhookId,
    currency: r.currency,
    paypalWebhookUrl: '/api/v1/payments/paypal/webhook',
  };
}

/** Saves admin input. A blank/omitted secret keeps the stored one (so the form never needs to re-display it). */
async function update(input = {}) {
  const doc = (await PaymentConfig.findOne().select('+paypalClientSecretEnc')) || new PaymentConfig();
  if (input.paypalEnabled !== undefined) doc.paypalEnabled = !!input.paypalEnabled;
  if (input.paypalEnvironment) doc.paypalEnvironment = input.paypalEnvironment === 'live' ? 'live' : 'sandbox';
  if (input.paypalClientId !== undefined) doc.paypalClientId = String(input.paypalClientId).trim();
  if (input.paypalClientSecret) doc.paypalClientSecretEnc = encrypt(String(input.paypalClientSecret).trim());
  if (input.clearClientSecret === true) doc.paypalClientSecretEnc = '';
  if (input.paypalWebhookId !== undefined) doc.paypalWebhookId = String(input.paypalWebhookId).trim();
  doc.currency = 'USD';
  await doc.save();
  return getAdminView();
}

/** Public, non-secret description of what the checkout may offer. */
async function getPublicMethods() {
  const [r, setting] = await Promise.all([getRuntime(), Setting.findOne().lean()]);
  return {
    paypal: {
      enabled: r.enabled,
      // Non-secret hint so the checkout can explain a missing option instead of silently showing only COD.
      unavailableReason: r.enabled ? '' : (!r.clientId || !r.secret ? 'not_configured' : 'disabled'),
      clientId: r.enabled ? r.clientId : '', // the Client ID is public by design; the secret never leaves the server
      environment: r.environment,
      currency: r.currency,
    },
    cod: { enabled: setting ? setting.codEnabled !== false : true },
  };
}

module.exports = { getRuntime, getAdminView, update, getPublicMethods };
