import rateLimit from 'express-rate-limit'
import config from '../config/index.js'

// VaultLevel 7 rate limiter with enhanced security
export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.maxRequests || config.rateLimit.maxRequests,
    message: {
      message: 'Too many requests from this IP, please try again later.',
      vaultLevel: config.vault.level,
      faaX13Compliant: true,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      if (config.faaX13.auditLog) {
        console.log('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          timestamp: new Date().toISOString(),
        })
      }
      res.status(429).json({
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      })
    },
  })
}

// API-specific rate limiters
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts
})

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
})

export const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
})
