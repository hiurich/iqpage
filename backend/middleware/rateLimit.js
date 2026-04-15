const rateLimit = require('express-rate-limit');

/**
 * 50 calls per hour per user (identified by JWT sub claim in IP fallback).
 */
// Standard limiter for free/edu/pro users (50 req/hr).
// Power users are routed to powerLimiter by adaptiveLimiter and never reach this.
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  keyGenerator: (req) => req.user?.id ?? req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Maximum 50 requests per hour.' },
});

const powerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user?.id ?? req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Maximum 100 requests per hour.' },
});

/**
 * Adaptive limiter: uses power limit for power users, standard for others.
 */
function adaptiveLimiter(req, res, next) {
  const plan = req.user?.profile?.plan ?? 'free';
  if (plan === 'power') {
    return powerLimiter(req, res, next);
  }
  return apiLimiter(req, res, next);
}

module.exports = { adaptiveLimiter };
