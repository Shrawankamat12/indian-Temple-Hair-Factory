const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const shippingService = require('../services/shipping.service');
const Setting = require('../models/Setting');
const logger = require('../config/logger');

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// GET /api/v1/shipping/check?pincode=XXXXXX  (public)
// Live serviceability via Shiprocket when credentials exist (estimated:false);
// otherwise a store-settings estimate that is explicitly marked estimated:true.
exports.checkPincode = asyncHandler(async (req, res) => {
  const pincode = String(req.query.pincode || '').trim();
  if (!/^[1-9][0-9]{5}$/.test(pincode)) throw new AppError('Enter a valid 6-digit pincode', 400);

  if (shippingService.isConfigured) {
    try {
      const r = await shippingService.checkServiceability(pincode);
      if (!r.serviceable) {
        return res.json({ success: true, data: { pincode, serviceable: false, estimated: false } });
      }
      const min = r.minDays ?? 3;
      const max = r.maxDays ?? min + 3;
      return res.json({
        success: true,
        data: { pincode, serviceable: true, estimated: false, minDays: min, maxDays: max, cod: r.cod, earliest: addDays(min), latest: addDays(max) },
      });
    } catch (err) {
      logger.warn(`Shiprocket serviceability failed, using estimate: ${err.message}`);
    }
  }

  const settings = await Setting.findOne().lean();
  const min = settings?.deliveryMinDays || 3;
  const max = settings?.deliveryMaxDays || 6;
  res.json({
    success: true,
    data: { pincode, serviceable: null, estimated: true, minDays: min, maxDays: max, earliest: addDays(min), latest: addDays(max) },
  });
});
