const { settingRepository } = require('../repositories');

class SettingService {
  async get() {
    let settings = await settingRepository.model.findOne();
    if (!settings) settings = await settingRepository.create({});
    return settings;
  }

  async update(payload) {
    let settings = await settingRepository.model.findOne();
    if (!settings) settings = await settingRepository.create(payload);
    else settings = await settingRepository.updateById(settings._id, payload);
    return settings;
  }
}

/** Fields the storefront may read. Anything not listed here (SMTP/SMS/gateway keys, etc.) is never public. */
const PUBLIC_FIELDS = [
  'storeName', 'legalName', 'storeEmail', 'storePhone', 'whatsapp', 'storeAddress', 'businessDescription', 'businessHours',
  'buildingNumber', 'floor', 'area', 'landmark', 'city', 'state', 'country', 'pincode', 'googleMapsUrl',
  'gstNumber', 'logo', 'favicon',
  'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'twitter', 'pinterest',
  'freeShippingThreshold', 'flatShippingRate', 'expressShippingRate', 'deliveryMinDays', 'deliveryMaxDays',
  'codEnabled', 'taxRate', 'taxLabel',
  'allowCustomerCancellation', 'allowReturnRequests', 'allowRefundRequests', 'policyContactNote',
  'seoTitle', 'seoDescription', 'seoKeywords',
];

SettingService.prototype.getPublic = async function getPublic() {
  const doc = (await settingRepository.model.findOne().lean()) || {};
  const out = {};
  PUBLIC_FIELDS.forEach((k) => { if (doc[k] !== undefined && doc[k] !== null && doc[k] !== '') out[k] = doc[k]; });
  // Free-shipping threshold / rates always come back so the UI never guesses them.
  const { shippingConfig } = require('./pricing.service');
  const sc = shippingConfig(doc);
  out.shipping = { freeShippingThreshold: sc.freeShippingThreshold, standardRate: sc.standardRate, expressRate: sc.expressRate, deliveryMinDays: doc.deliveryMinDays ?? 3, deliveryMaxDays: doc.deliveryMaxDays ?? 6 };
  // One display-ready address built only from the parts the admin filled in — nothing is invented or duplicated.
  const seen = new Set();
  const part = (v) => { const t = String(v || '').trim(); const k = t.toLowerCase(); if (!t || seen.has(k)) return null; seen.add(k); return t; };
  const lines = [part(doc.buildingNumber), part(doc.floor), part(doc.storeAddress), part(doc.area), part(doc.landmark)].filter(Boolean);
  const cityLine = [part(doc.city), part(doc.pincode)].filter(Boolean).join(' - ');
  out.addressLines = [...lines, cityLine, part(doc.state), part(doc.country)].filter(Boolean);
  out.formattedAddress = out.addressLines.join(', ');
  out.policy = {
    customerCancellation: !!doc.allowCustomerCancellation,
    returns: !!doc.allowReturnRequests,
    refunds: !!doc.allowRefundRequests,
  };
  return out;
};

module.exports = new SettingService();
