const mongoose = require('mongoose');

// Singleton document — one Settings row for the whole store. Flat field
// names deliberately mirror the admin panel's Settings.jsx form exactly,
// so no field-mapping layer is needed between frontend and backend.
const settingSchema = new mongoose.Schema({
  // General / Business information (single source of truth for header, footer, contact, checkout, invoices)
  storeName: String, legalName: String, storeEmail: String, storePhone: String, storeAddress: String,
  businessDescription: String, businessHours: String,
  buildingNumber: String, floor: String, area: String, landmark: String,
  city: String, state: String, country: String, pincode: String, googleMapsUrl: String,
  gstNumber: String, logo: String, favicon: String,
  // SEO
  seoTitle: String, seoDescription: String, seoKeywords: String,
  // Shipping
  freeShippingThreshold: Number, flatShippingRate: Number, expressShippingRate: Number, shippingZones: String,
  // Used by GET /shipping/check when live courier serviceability is unavailable (shown to shoppers as an estimate)
  deliveryMinDays: { type: Number, default: 3 }, deliveryMaxDays: { type: Number, default: 6 },
  // Payment (PayPal credentials live in PaymentConfig, never here)
  paymentGateway: String, razorpayKey: String, codEnabled: { type: Boolean, default: true },
  // Order policy. Business rule: no cancellations / returns / refunds. These flags drive what the storefront may show.
  allowCustomerCancellation: { type: Boolean, default: false },
  allowReturnRequests: { type: Boolean, default: false },
  allowRefundRequests: { type: Boolean, default: false },
  policyContactNote: String,
  // Tax
  taxRate: Number, taxLabel: { type: String, default: 'GST' },
  // Email
  smtpHost: String, smtpPort: String, smtpUser: String, smtpFrom: String,
  // SMS
  smsProvider: String, smsApiKey: String,
  // Social
  facebook: String, instagram: String, linkedin: String, youtube: String, tiktok: String, twitter: String, pinterest: String, whatsapp: String,
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
