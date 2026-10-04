const router = require('express').Router();
const { submitWholesaleInquiry } = require('../controllers/wholesale.controller');
const validate = require('../middleware/validate.middleware');
const { formLimiter } = require('../middleware/rateLimiter.middleware');
const { xssClean } = require('../middleware/security.middleware');
const { submitWholesaleRules } = require('../validators/wholesale.validator');

router.post('/', formLimiter, xssClean(), submitWholesaleRules, validate, submitWholesaleInquiry);

module.exports = router;
