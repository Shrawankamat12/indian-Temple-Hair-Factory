/**
 * One-time helper: converts the money fields that were stored in INR into USD, in place.
 *
 *   node scripts/convert-inr-to-usd.js 84            -> DRY RUN (prints what would change, writes nothing)
 *   node scripts/convert-inr-to-usd.js 84 --apply    -> actually writes the converted values
 *
 * "84" = how many rupees equal 1 US dollar. Use your own rate.
 * Converts: products (price, mrp, discountPrice, costPrice, variant prices), flat coupons (value,
 * minOrderValue, maxDiscount) and the shipping settings (free-shipping threshold, standard, express).
 * Existing ORDERS are NOT touched (they are historical records). Take a database backup first.
 * Run it ONCE only: running it twice divides the numbers twice.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Coupon = require('../src/models/Coupon');
const Setting = require('../src/models/Setting');

const rate = Number(process.argv[2]);
const apply = process.argv.includes('--apply');
if (!(rate > 0)) { console.error('Usage: node scripts/convert-inr-to-usd.js <INR per 1 USD> [--apply]'); process.exit(1); }
const usd = (n) => (n === undefined || n === null || Number.isNaN(Number(n)) ? n : Math.round((Number(n) / rate) * 100) / 100);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(apply ? 'APPLYING changes' : 'DRY RUN (add --apply to write)', `| rate: ₹${rate} = $1`);

  let np = 0;
  for (const p of await Product.find({})) {
    const before = `${p.price}/${p.mrp}`;
    ['price', 'mrp', 'discountPrice', 'costPrice'].forEach((k) => { if (p[k] != null) p[k] = usd(p[k]); });
    (p.variants || []).forEach((v) => { if (v.price != null) v.price = usd(v.price); });
    console.log(`product ${p.name}: ${before} -> ${p.price}/${p.mrp}`);
    if (apply) await p.save(); np++;
  }

  let nc = 0;
  for (const c of await Coupon.find({})) {
    if (c.type === 'flat') c.value = usd(c.value);
    if (c.minOrderValue) c.minOrderValue = usd(c.minOrderValue);
    if (c.maxDiscount) c.maxDiscount = usd(c.maxDiscount);
    console.log(`coupon ${c.code}: value ${c.value}, min ${c.minOrderValue}, max ${c.maxDiscount}`);
    if (apply) await c.save(); nc++;
  }

  const s = await Setting.findOne();
  if (s) {
    ['freeShippingThreshold', 'flatShippingRate', 'expressShippingRate'].forEach((k) => { if (s[k] != null) s[k] = usd(s[k]); });
    console.log(`settings: free over ${s.freeShippingThreshold}, standard ${s.flatShippingRate}, express ${s.expressShippingRate}`);
    if (apply) await s.save();
  }
  console.log(`${np} products, ${nc} coupons${s ? ', settings' : ''} ${apply ? 'converted' : 'would be converted'}.`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
