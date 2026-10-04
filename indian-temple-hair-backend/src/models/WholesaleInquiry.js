const mongoose = require('mongoose');

const wholesaleInquirySchema = new mongoose.Schema({
  businessName: { type: String, trim: true, default: '' },   // "Company"
  contactName: { type: String, required: true, trim: true },  // "Name"
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  country: { type: String, trim: true },
  subject: { type: String, trim: true, maxlength: 200 },
  enquiryType: { type: String, enum: ['wholesale', 'bulk_order', 'export', 'private_label', 'general'], default: 'wholesale' },
  message: { type: String, maxlength: 4000 },
  requirement: { type: String },     // legacy free-text: products / quantity needed (older form)
  estimatedMOQ: { type: String },
  status: { type: String, enum: ['new', 'contacted', 'in_progress', 'quoted', 'converted', 'closed'], default: 'new' },
  notes: { type: String },           // internal admin notes
}, { timestamps: true });

wholesaleInquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('WholesaleInquiry', wholesaleInquirySchema);
