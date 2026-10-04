/**
 * One-off migration: applies the client's "no return / no refund / no cancellation" policy wording and switches
 * the matching Settings flags off. Safe to re-run.
 *
 *   node src/scripts/apply-client-policies.js           # dry run — shows what would change
 *   node src/scripts/apply-client-policies.js --apply   # writes to the database
 *
 * It only touches the `returns`, `refund` and `cancellation` policy pages; shipping, privacy and terms are left alone.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const SiteContent = require('../models/SiteContent');
const Setting = require('../models/Setting');
const { clientPolicies } = require('../utils/defaultPolicies');

(async () => {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGO_URI);
  const sc = (await SiteContent.findOne()) || new SiteContent();
  const before = (sc.policies || []).map((p) => p.slug);
  for (const pol of clientPolicies) {
    const i = sc.policies.findIndex((p) => p.slug === pol.slug);
    if (i >= 0) sc.policies[i] = pol; else sc.policies.push(pol);
  }
  console.log(`Policy pages before: [${before.join(', ')}]`);
  console.log(`Will set: ${clientPolicies.map((p) => p.slug).join(', ')}; settings allowCustomerCancellation/allowReturnRequests/allowRefundRequests = false`);
  if (apply) {
    await sc.save();
    const s = (await Setting.findOne()) || new Setting();
    s.allowCustomerCancellation = false; s.allowReturnRequests = false; s.allowRefundRequests = false;
    await s.save();
    console.log('Applied.');
  } else {
    console.log('Dry run only. Re-run with --apply to write.');
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
