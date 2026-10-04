const mongoose = require('mongoose');

// Singleton. Admin → Settings → Payments. Secrets live ONLY here (encrypted) or in env vars and are
// never returned by any API: the admin API reports `hasClientSecret` / `hasWebhookId` booleans instead.
const paymentConfigSchema = new mongoose.Schema(
  {
    paypalEnabled: { type: Boolean, default: false },
    paypalEnvironment: { type: String, enum: ['sandbox', 'live'], default: 'sandbox' },
    paypalClientId: { type: String, trim: true, default: '' },
    paypalClientSecretEnc: { type: String, default: '', select: false },
    paypalWebhookId: { type: String, trim: true, default: '' },

    // Catalogue, shipping, coupons and order totals are all in US dollars; PayPal charges the same USD amount.
    currency: { type: String, uppercase: true, trim: true, default: 'USD' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentConfig', paymentConfigSchema);
