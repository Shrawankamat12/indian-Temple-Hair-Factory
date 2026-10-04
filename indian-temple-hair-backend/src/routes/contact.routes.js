const router = require('express').Router();
const { submitContact } = require('../controllers/contact.controller');
const validate = require('../middleware/validate.middleware');
const { formLimiter } = require('../middleware/rateLimiter.middleware');
const { xssClean } = require('../middleware/security.middleware');
const { submitContactRules } = require('../validators/contact.validator');

router.post('/', formLimiter, xssClean(), submitContactRules, validate, submitContact);

module.exports = router;
