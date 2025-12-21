const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');

// DDoS Protection Middleware
const ddosProtection = {
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP',
  }),

  apiLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'API rate limit exceeded',
  }),

  speedLimiter: slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: 500,
  }),

  securityHeaders: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),

  blockedIPs: new Set(),
  
  blockIP: (ip) => {
    ddosProtection.blockedIPs.add(ip);
    setTimeout(() => ddosProtection.blockedIPs.delete(ip), 24 * 60 * 60 * 1000);
  },

  ipBlocker: (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (ddosProtection.blockedIPs.has(clientIP)) {
      return res.status(403).json({ error: 'IP blocked' });
    }
    next();
  },
};

module.exports = ddosProtection;