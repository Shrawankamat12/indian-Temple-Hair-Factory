const asyncHandler = require('express-async-handler');
const settingService = require('../services/setting.service');

exports.getSettings = asyncHandler(async (req, res) => {
  const data = await settingService.get();
  res.json({ success: true, data });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const data = await settingService.update(req.body);
  res.json({ success: true, data });
});

// GET /api/v1/settings/public — business info, shipping rates, policy flags. Whitelisted; no secrets.
exports.getPublicSettings = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await settingService.getPublic() });
});

// Admin → Settings → Payments. Secrets are write-only: responses only say whether one is stored.
const paymentConfig = require('../services/paymentConfig.service');
exports.getPaymentSettings = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await paymentConfig.getAdminView() });
});
exports.updatePaymentSettings = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await paymentConfig.update(req.body) });
});
