const mongoose = require('mongoose');

// One row per PayPal webhook delivery. The unique index on eventId is what makes webhook
// processing idempotent: a replayed / duplicated delivery fails the insert and is ignored.
const webhookEventSchema = new mongoose.Schema(
  {
    provider: { type: String, default: 'paypal' },
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String },
    resourceId: { type: String },
    orderNumber: { type: String },
    outcome: { type: String, default: 'received' }, // received | applied | ignored | error
    note: { type: String },
  },
  { timestamps: true }
);

webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 }); // keep 180 days

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
