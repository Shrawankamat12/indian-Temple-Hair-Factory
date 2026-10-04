const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: String,
  company: String,
  country: String,
  subject: String,
  enquiryType: { type: String, enum: ['general', 'order', 'product', 'shipping', 'wholesale', 'other'], default: 'general' },
  message: { type: String, required: true, maxlength: 4000 },
  status: { type: String, enum: ['new', 'read', 'contacted', 'in_progress', 'replied', 'converted', 'archived', 'closed'], default: 'new' },
  reply: { type: String },
}, { timestamps: true });

contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
