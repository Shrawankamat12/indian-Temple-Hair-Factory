// Run `npm run seed` to insert an admin user, sample categories, products,
// testimonials, FAQs and a blog post — enough for the storefront to render
// real data end-to-end. Re-run any time; it's idempotent (clears + reinserts
// catalog content, but never touches existing orders/users beyond the admin).
require("dotenv").config();
const mongoose = require("mongoose");
const slugify = require("slugify");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Testimonial = require("../models/Testimonial");
const Faq = require("../models/Faq");
const Blog = require("../models/Blog");
const Attribute = require("../models/Attribute");
const Banner = require("../models/Banner");
const SiteContent = require("../models/SiteContent");

const categories = [
  {
    name: "Temple Hair Bundles",
    slug: "temple-bundles",
    tag: "Single Donor · Cuticle Intact",
    tone: "gold",
  },
  {
    name: "Hair Extensions",
    slug: "extensions",
    tag: "Tape-in · I-Tip · U-Tip · V-Tip",
    tone: "brown",
  },
  {
    name: "Closures & Frontals",
    slug: "closures",
    tag: "HD 13x4 · 13x6",
    tone: "beige",
  },
  {
    name: "Wigs & Toppers",
    slug: "wigs",
    tag: "Full Lace · Bob · Curly · Long Wavy",
    tone: "espresso",
  },
  {
    name: "Blonde Hair",
    slug: "blonde",
    tag: "Lightened & Toned",
    tone: "cream",
  },
  {
    name: "Bulk Hair",
    slug: "bulk",
    tag: "Braiding · Micro-Ring",
    tone: "gold",
  },
];

function product(name, categorySlug, overrides = {}) {
  return {
    name,
    slug: slugify(name, { lower: true, strict: true }),
    sku:
      "ITH-" +
      slugify(name, { strict: true }).toUpperCase().slice(0, 10) +
      "-" +
      Math.floor(Math.random() * 900 + 100),
    texture: "Straight",
    hairType: "Remy",
    length: 18,
    color: "Natural Black",
    weight: "100g",
    mrp: 12000,
    price: 9500,
    discountPct: 21,
    stock: 40,
    tone: "gold",
    images: [],
    isActive: true,
    __categorySlug: categorySlug,
    ...overrides,
  };
}

const sampleProducts = [
  product('Silky Straight Temple Bundle 18"', "temple-bundles", {
    badge: "Bestseller",
    texture: "Straight",
  }),
  product('Body Wave Double Drawn 20"', "temple-bundles", {
    badge: "Bestseller",
    texture: "Body Wave",
    tone: "brown",
  }),
  product("HD 13x4 Lace Frontal", "closures", {
    badge: "Trending",
    texture: "Straight",
    tone: "beige",
    price: 6500,
    mrp: 8200,
  }),
  product('Full Lace Bob Wig 12"', "wigs", {
    badge: "New",
    length: 12,
    tone: "espresso",
    price: 15500,
    mrp: 19000,
  }),
  product('Deep Curly Frontal Wig 22"', "wigs", {
    badge: "Trending",
    texture: "Deep Curly",
    length: 22,
    tone: "espresso",
  }),
  product('Tape-in Extensions Set 20"', "extensions", {
    badge: "Bestseller",
    length: 20,
    tone: "gold",
  }),
  product('#613 Blonde Bundle 22"', "blonde", {
    badge: "New",
    length: 22,
    color: "#613 Blonde",
    tone: "cream",
    price: 13500,
    mrp: 17000,
  }),
  product('Kinky Curly Temple Bundle 16"', "temple-bundles", {
    texture: "Kinky Curly",
    length: 16,
    hairType: "Raw",
    tone: "brown",
  }),
  product("4x4 HD Lace Closure", "closures", {
    texture: "Straight",
    tone: "beige",
    price: 4800,
    mrp: 6000,
  }),
  product("Braiding Bulk Hair 100g", "bulk", {
    hairType: "Virgin",
    tone: "gold",
    price: 3200,
    mrp: 4000,
  }),
];

const testimonials = [
  {
    name: "Amara Okafor",
    country: "Nigeria",
    quote:
      "Single donor bundles arrived exactly as per the sample — no shedding after three washes.",
    rating: 5,
    isActive: true,
    order: 1,
  },
  {
    name: "Priya Nair",
    country: "UAE",
    quote:
      "We reorder every month for the salon. Texture stays consistent and dispatch from New Delhi is quick.",
    rating: 5,
    isActive: true,
    order: 2,
  },
  {
    name: "Latoya Brown",
    country: "USA",
    quote: "Genuine temple hair at real export pricing — paperwork was clean on both shipments.",
    rating: 4.5,
    isActive: true,
    order: 3,
  },
];

const faqs = [
  {
    category: "Shipping",
    question: "How fast do you ship?",
    answer:
      "Orders are dispatched from our New Delhi unit within 24 hours. Domestic delivery takes 3–6 business days, international 6–12 business days.",
    isActive: true,
    order: 1,
  },
  {
    category: "Returns",
    question: "What is your return policy?",
    answer:
      "Unused, unopened bundles can be returned within 7 days of delivery for a full refund.",
    isActive: true,
    order: 1,
  },
  {
    category: "Hair Care",
    question: "How do I care for temple Remy hair?",
    answer:
      "Wash with sulfate-free shampoo, condition mid-length to ends, and air-dry when possible to preserve the cuticle alignment.",
    isActive: true,
    order: 1,
  },
  {
    category: "Bulk / Export",
    question: "Do you offer wholesale and export pricing?",
    answer:
      "Yes — we are a GST-registered exporter (07AGVPB7155J1ZY). Submit an enquiry on the Wholesale page for bulk rates and export documentation details.",
    isActive: true,
    order: 1,
  },
];

const blogs = [
  {
    title: "What Makes Temple Hair Different",
    slug: "what-makes-temple-hair-different",
    category: "Company",
    excerpt:
      "Why donor-wise sorting at our New Delhi unit decides how a bundle behaves six months later.",
    content:
      "Temple hair is donated during tonsure, tied and never chemically stripped — which is why the cuticle layer survives the journey to our unit intact.\n\nWe keep each donor's hair separate through washing, double drawing and wefting. That is the reason one bundle matches the next in density and texture, and why it stays tangle-free wash after wash.",
    isPublished: true,
    publishedAt: new Date(),
  },
];


// ---- Storefront redesign seed: attributes, banners, announcements, policies ----
// Banner.image is required by the schema, so sample banners point at a neutral placeholder
// (/uploads/seed-placeholder.svg). Replace each one from Admin → Banners; the storefront treats
// the placeholder as "no image" and falls back to its bundled photos.
const PH = "/uploads/seed-placeholder.svg";

const attributes = [
  ...["Straight", "Body Wave", "Deep Wave", "Water Wave", "Curly", "Kinky Straight"].map((name, i) => ({ type: "hairTexture", name, value: name, sortOrder: i })),
  ...["Transparent Lace", "HD Lace", "Swiss Lace"].map((name, i) => ({ type: "laceType", name, value: name, sortOrder: i })),
  ...["Remy", "Virgin", "Raw"].map((name, i) => ({ type: "hairType", name, value: name, sortOrder: i })),
  ...["130%", "150%", "180%"].map((name, i) => ({ type: "hairDensity", name, value: name, sortOrder: i })),
];

const banners = [
  { placement: "home-hero", title: "Pure Indian Hair. Naturally Beautiful.", subtitle: "Premium quality human hair, wigs & extensions", ctaText: "Shop Now", ctaLink: "/shop", order: 0 },
  { placement: "home-mid", title: "Indian Raw Hair", subtitle: "Pure. Natural. Unprocessed.", ctaText: "Shop Now", ctaLink: "/shop", order: 0 },
  { placement: "offer-card", title: "New Arrivals", subtitle: "Fresh drops, just landed", ctaText: "Shop Now", ctaLink: "/shop?sort=newest", order: 0 },
  { placement: "offer-card", title: "Flat 20% Off", subtitle: "On selected bundles", ctaText: "Shop Now", ctaLink: "/shop", order: 1 },
  { placement: "offer-card", title: "Combo Offer", subtitle: "Bundle more, save more", ctaText: "Shop Now", ctaLink: "/shop", order: 2 },
  { placement: "offer-card", title: "First Order Offer", subtitle: "Use your welcome code at checkout", ctaText: "Shop Now", ctaLink: "/shop", order: 3 },
  ...["Seasonal Pick 1", "Seasonal Pick 2", "Seasonal Pick 3", "Seasonal Pick 4"].map((title, i) => ({ placement: "seasonal-offer", title, ctaText: "Shop Now", ctaLink: "/shop", order: i })),
  { placement: "home-strip", title: "Virtual Try-On", subtitle: "Find the look that suits you", ctaText: "Try Now", ctaLink: "/contact", order: 0 },
  { placement: "shop-top", title: "The Complete Collection", subtitle: "Hand-inspected at our Delhi unit", order: 0 },
  { placement: "category-top", title: "Shop by Category", subtitle: "Pure. Natural. Luxurious.", order: 0 },
  { placement: "deal-of-day", title: "Deal of the Day", subtitle: "Limited time", ctaText: "Shop Now", ctaLink: "/shop", order: 0 },
  { placement: "popup", title: "Welcome Offer", subtitle: "Get 10% off your first order", ctaText: "Shop Now", ctaLink: "/shop", order: 0 },
].map((b) => ({ image: PH, isActive: true, ...b }));

const policies = [
  { slug: "shipping", title: "Shipping Policy", sections: [
    { heading: "Dispatch time", body: "Orders are dispatched from our New Delhi unit within 24 hours of confirmation." },
    { heading: "Delivery time", body: "Domestic delivery typically takes 3-6 business days. International delivery takes 6-12 business days." },
    { heading: "Shipping charges", body: "Standard shipping is charged at checkout. Orders above the free-shipping threshold ship free." },
    { heading: "Tracking", body: "You will receive tracking details by email and SMS once your order ships." },
  ] },
  ...require("./defaultPolicies").clientPolicies,
  { slug: "privacy", title: "Privacy Policy", sections: [
    { heading: "Information we collect", body: "We collect the details you provide at checkout, account sign-up, contact and newsletter forms." },
    { heading: "How we use it", body: "To process orders, deliver products, provide support and, if you opt in, send updates." },
    { heading: "Payments", body: "Online payments are processed by PayPal. We never see or store your card or PayPal login details." },
    { heading: "Your choices", body: "You can request access, correction or deletion of your data by contacting us." },
  ] },
  { slug: "terms", title: "Terms of Service", sections: [
    { heading: "Using this site", body: "By using this website you agree to these terms and to all applicable laws." },
    { heading: "Orders & pricing", body: "Prices are in INR and may change without notice. An order is confirmed only after payment or COD verification." },
    { heading: "Product information", body: "We take care to describe and photograph products accurately; colours may vary slightly by screen." },
    { heading: "Contact", body: "Questions about these terms can be sent through our Contact page." },
  ] },
];

const announcements = [
  "Free Shipping on orders above the free-shipping threshold",
  "Cash on Delivery available",
  "Easy 7-day returns on unused products",
];

async function run() {
  await connectDB();

  const insertedCategories = await Category.deleteMany().then(() =>
    Category.insertMany(categories),
  );
  const catBySlug = Object.fromEntries(
    insertedCategories.map((c) => [c.slug, c._id]),
  );

  await Product.deleteMany();
  await Product.insertMany(
    sampleProducts.map(({ __categorySlug, ...p }) => ({
      ...p,
      category: catBySlug[__categorySlug],
    })),
  );

  await Testimonial.deleteMany();
  await Testimonial.insertMany(testimonials);

  await Faq.deleteMany();
  await Faq.insertMany(faqs);

  await Blog.deleteMany();
  await Blog.insertMany(blogs);


  await Attribute.deleteMany();
  await Attribute.insertMany(attributes);

  await Banner.deleteMany();
  await Banner.insertMany(banners);

  // SiteContent is a singleton: only touch the new fields, keep anything the admin already edited
  let sc = await SiteContent.findOne();
  if (!sc) sc = new SiteContent();
  if (!sc.announcements || !sc.announcements.length) sc.announcements = announcements;
  if (!sc.policies || !sc.policies.length) sc.policies = policies;
  await sc.save();

  const adminExists = await User.findOne({ email: "admin@indiantemplehair.com" });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@indiantemplehair.com",
      password: "Admin@123",
      role: "admin",
    });
    console.log("Admin user created: admin@indiantemplehair.com / Admin@123");
  }

  console.log(
    `Seed complete — ${insertedCategories.length} categories, ${sampleProducts.length} products, ${testimonials.length} testimonials, ${faqs.length} FAQs, ${blogs.length} blog post(s), ${attributes.length} attributes, ${banners.length} banners, ${policies.length} policy pages.`,
  );
  mongoose.connection.close();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  mongoose.connection.close();
});
