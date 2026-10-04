const router = require('express').Router();
const { getPublicSettings } = require('../controllers/setting.controller');

router.get('/public', getPublicSettings);

module.exports = router;
