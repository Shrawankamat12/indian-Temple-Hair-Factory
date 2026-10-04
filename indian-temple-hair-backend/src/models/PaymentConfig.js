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

    // Catalogue prices are stored in INR. PayPal India accounts are for receiving international payments
    // and generally cannot charge buyers in INR, so the charge currency and the INR→charge-currency
    // rate are admin-controlled. The backend does the conversion; the browser never does.
    currency: { type: String, uppercase: true, trim: true, default: 'USD' },
    inrPerUnit: { type: Number, min: 0, default: 0 }, // e.g. 84 means 1 USD = ₹84. Required when currency != INR.
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentConfig', paymentConfigSchema);
