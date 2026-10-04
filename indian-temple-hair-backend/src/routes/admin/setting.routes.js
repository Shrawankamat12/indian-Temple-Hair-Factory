const router = require('express').Router();
const { getSettings, updateSettings, getPaymentSettings, updatePaymentSettings } = require('../../controllers/setting.controller');
const { requireRole } = require('../../middleware/admin.middleware');
const { ROLES } = require('../../constants/roles');

router.get('/', getSettings);
router.put('/', requireRole(ROLES.ADMIN), updateSettings);
router.get('/payments', requireRole(ROLES.ADMIN), getPaymentSettings);
router.put('/payments', requireRole(ROLES.ADMIN), updatePaymentSettings);

module.exports = router;
