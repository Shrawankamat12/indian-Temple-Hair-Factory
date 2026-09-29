const router = require('express').Router();
const { checkPincode } = require('../controllers/shipping.controller');

router.get('/check', checkPincode);

module.exports = router;
