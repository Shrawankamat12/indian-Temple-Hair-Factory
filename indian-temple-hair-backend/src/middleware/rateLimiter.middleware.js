const rateLimit = require('express-rate-limit');

// Generous general limiter for the whole /api/v1 surface.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again shortly.' },
});

// Tighter limiter for login/register/admin-login to slow down brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

// Payment calls and public form posts: enough for a real shopper, tight enough to stop abuse.
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 40, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many payment attempts, please try again shortly.' },
});
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many submissions, please try again later.' },
});
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many reviews submitted, please try again later.' },
});

module.exports = { apiLimiter, authLimiter, paymentLimiter, formLimiter, reviewLimiter };
