require('dotenv').config();
const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60_000,  // e.g. 1 minute
  max:     parseInt(process.env.RATE_LIMIT_MAX,    10) || 100,     // e.g. 100 requests
  standardHeaders: true,  // Return rate limit info in the RateLimit-* headers
  legacyHeaders:  false,  // Disable the old X-RateLimit-* headers
});

module.exports = { rateLimiter };
