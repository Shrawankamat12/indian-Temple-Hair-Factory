/**
 * Recalculates every product's rating / reviewsCount from APPROVED reviews only, and back-fills the new
 * review `status` for legacy rows that only had the old isApproved flag.  Run once after deploying the review changes.
 *   node src/scripts/recompute-ratings.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const r = await Review.updateMany({ isApproved: true, status: 'pending' }, { $set: { status: 'approved' } });
  console.log(`Back-filled status=approved on ${r.modifiedCount} legacy review(s)`);
  const agg = await Review.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
  const rated = new Set();
  for (const a of agg) { rated.add(String(a._id)); await Product.updateOne({ _id: a._id }, { $set: { rating: Math.round(a.avg * 10) / 10, reviewsCount: a.count } }); }
  const z = await Product.updateMany({ _id: { $nin: [...rated] }, $or: [{ rating: { $ne: 0 } }, { reviewsCount: { $ne: 0 } }] }, { $set: { rating: 0, reviewsCount: 0 } });
  console.log(`Updated ${agg.length} product(s); reset ${z.modifiedCount} product(s) with no approved reviews`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
