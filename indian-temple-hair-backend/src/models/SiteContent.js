const mongoose = require('mongoose');

// Singleton document (one row) — mirrors the Setting.js pattern already used
// for store settings. This model exists so every previously hardcoded block
// on the storefront Home page, Footer and Header can be edited from the
// admin panel without a redeploy.

const linkSchema = new mongoose.Schema({ label: String, url: String }, { _id: false });

const siteContentSchema = new mongoose.Schema({
  // ---------------- HOME PAGE ----------------
  hero: {
    eyebrow: { type: String, default: 'Manufacturer · Exporter · Supplier of Indian Temple Hair' },
    title: { type: String, default: 'Authentic Indian Temple Hair.' },
    highlightText: { type: String, default: 'Single Donor. Cuticle Intact.' },
    subtitle: { type: String, default: 'Temple-collected, single-donor Remy hair from South India — processed and exported directly from our New Delhi unit to salons and distributors worldwide.' },
    image: { type: String },
    primaryCtaText: { type: String, default: 'Shop Now' },
    primaryCtaLink: { type: String, default: '/shop' },
    secondaryCtaText: { type: String, default: 'Explore Collection' },
    secondaryCtaLink: { type: String, default: '/about' },
    badges: { type: [String], default: ['100% Temple Remy Hair', 'Single Donor Bundles', 'Direct Export Pricing', 'Worldwide Shipping'] },
    stats: {
      type: [{ value: String, label: String, _id: false }],
      default: [{ value: '100%', label: 'Temple Remy' }, { value: '150+', label: 'In-House Artisans' }, { value: '40+', label: 'Export Countries' }],
    },
    ratingValue: { type: Number, default: 4.9 },
    ratingLabel: { type: String, default: '4.9 average from verified buyers' },
  },

  whyChooseUs: {
    eyebrow: { type: String, default: 'Why Indian Temple Remy Hair Exports' },
    title: { type: String, default: 'Straight from the temple floor to your salon' },
    items: {
      type: [{ title: String, description: String, _id: false }],
      default: [
        { title: 'Genuine Temple Hair', description: 'Collected from South Indian temple donations only — never mixed with salon or fallen hair.' },
        { title: 'Single Donor Bundles', description: 'One donor per bundle, so texture, density and colour stay consistent from weft to weft.' },
        { title: 'Cuticle Intact, Root Aligned', description: 'Hair is kept root-to-tip through every stage, which is what keeps the shine and stops tangling.' },
        { title: 'Direct Export Pricing', description: 'GST-registered exporter shipping from New Delhi with full documentation on every consignment.' },
      ],
    },
  },

  processSteps: {
    type: [{ step: String, desc: String, _id: false }],
    default: [
      { step: 'Temple Collection', desc: 'Hair is procured from South Indian temple tonsure donations, tied and kept root-aligned from the moment it is collected.' },
      { step: 'Hand Sorting', desc: 'Each lot is separated donor-wise by our team for length, texture and root direction before anything moves to production.' },
      { step: 'Washing & Conditioning', desc: 'Gentle, chemical-light washing keeps the cuticle layer intact instead of stripping it for speed.' },
      { step: 'Double Drawn & Wefting', desc: 'Short strands are pulled out by hand, then bundles are hand or machine wefted with reinforced double stitching at our Najafgarh Road unit.' },
      { step: 'Quality Check', desc: 'Every bundle is tested for shedding, tangling and colour consistency against the approved donor sample.' },
      { step: 'Export Packing', desc: 'Orders are packed with batch and invoice documentation and dispatched from New Delhi within 24 hours.' },
    ],
  },

  factoryGallery: {
    eyebrow: { type: String, default: 'Najafgarh Road Industrial Area, New Delhi' },
    title: { type: String, default: 'Inside Our Unit' },
    images: { type: [{ label: String, image: String, _id: false }], default: [] },
  },

  certifications: {
    type: [String],
    default: ['GST Registered Exporter — 07AGVPB7155J1ZY', '100% Cuticle-Aligned Temple Remy Hair', 'Single Donor & Fully Traceable', 'Export Documentation on Every Order'],
  },

  exportCountries: {
    type: [String],
    default: ['USA', 'UK', 'UAE', 'Nigeria', 'Canada', 'South Africa', 'Australia', 'Brazil', 'Kenya', 'Ghana', 'Germany', 'France'],
  },

  beforeAfter: {
    type: [{ title: String, tag: String, beforeImage: String, afterImage: String, _id: false }],
    default: [],
  },

  instagram: {
    handle: { type: String, default: '@indiantemplehairexports' },
    images: { type: [String], default: [] },
  },

  videoReviews: { type: [String], default: [] },

  couponBanner: {
    enabled: { type: Boolean, default: true },
    eyebrow: { type: String, default: 'Welcome Offer' },
    code: { type: String, default: 'TEMPLE10' },
    title: { type: String, default: 'off your first wholesale order' },
    discountText: { type: String, default: '10%' },
    ctaText: { type: String, default: 'Shop & Save' },
    ctaLink: { type: String, default: '/shop' },
  },

  faqTeaser: {
    eyebrow: { type: String, default: 'Have Questions?' },
    title: { type: String, default: "We've Got Answers" },
    description: { type: String, default: 'Sourcing, shipping timelines, hair care and wholesale export terms — answered in one place.' },
    ctaText: { type: String, default: 'Visit FAQ' },
  },

  newsletterSection: {
    eyebrow: { type: String, default: 'Stay In The Loop' },
    title: { type: String, default: 'Join the Indian Temple Hair List' },
    description: { type: String, default: 'New lots, restock alerts and wholesale-only pricing — straight to your inbox.' },
  },

  // Which flag-driven shelves show on Home, and in what order (admin toggle + reorder)
  homeSections: {
    type: [{ key: String, enabled: { type: Boolean, default: true }, order: { type: Number, default: 0 }, _id: false }],
    default: [
      { key: 'categories', enabled: true, order: 0 },
      { key: 'featuredCategories', enabled: true, order: 1 },
      { key: 'bestSellers', enabled: true, order: 2 },
      { key: 'flashSale', enabled: true, order: 3 },
      { key: 'newArrivals', enabled: true, order: 4 },
      { key: 'trending', enabled: true, order: 5 },
      { key: 'premium', enabled: true, order: 6 },
      { key: 'featuredProducts', enabled: true, order: 7 },
      { key: 'collections', enabled: true, order: 8 },
      { key: 'testimonials', enabled: true, order: 9 },
    ],
  },

  // ---------------- FOOTER ----------------
  footer: {
    brandDescription: { type: String, default: 'Indian Temple Remy Hair Exports — 100% human temple hair extensions, wigs, closures and raw bundles, processed and exported from Najafgarh Road Industrial Area, New Delhi.' },
    address: { type: String, default: '69/6A, Plot No. 74, Najafgarh Road Industrial Area, New Delhi, 110015, India' },
    phone: { type: String, default: '+91 89203 11195' },
    email: { type: String, default: 'indiantemplehairexports@gmail.com' },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    columns: {
      type: [{ title: String, links: [linkSchema], _id: false }],
      default: [
        { title: 'Shop', links: [{ label: 'Temple Hair Bundles', url: '/shop' }, { label: 'Hair Extensions', url: '/shop' }, { label: 'Closures & Frontals', url: '/shop' }, { label: 'Wigs & Toppers', url: '/shop' }, { label: 'Bulk Hair', url: '/shop' }] },
        { title: 'Company', links: [{ label: 'About Us', url: '/about' }, { label: 'Our Unit & Process', url: '/factory' }, { label: 'Export / Wholesale', url: '/wholesale' }, { label: 'Journal', url: '/journal' }, { label: 'Contact', url: '/contact' }] },
        { title: 'Support', links: [{ label: 'FAQ', url: '/faq' }, { label: 'Shipping & Returns', url: '/policy/shipping' }, { label: 'Privacy Policy', url: '/policy/privacy' }, { label: 'Terms of Service', url: '/policy/terms' }, { label: 'My Account', url: '/account' }] },
      ],
    },
    trustBadges: { type: [String], default: ['100% Temple Remy Hair', 'Single Donor', 'Worldwide Shipping', 'Secure Payments'] },
    bottomText: { type: String, default: 'Sourced in India, shipped worldwide. GSTIN 07AGVPB7155J1ZY' },
  },

  // ---------------- HEADER ----------------
  header: {
    announcementEnabled: { type: Boolean, default: false },
    announcementText: { type: String, default: '' },
    announcementLink: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('SiteContent', siteContentSchema);
