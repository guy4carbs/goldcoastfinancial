import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

// Standard rate limit response
const createRateLimitResponse = (message: string) => (req: Request, res: Response) => {
  res.status(429).json({
    error: 'Too many requests',
    message,
    retryAfter: res.getHeader('Retry-After'),
  });
};

/**
 * Login rate limiter
 * 5 attempts per 15 minutes per IP
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use default key generator (req.ip)
  handler: createRateLimitResponse('Too many login attempts. Please try again in 15 minutes.'),
  skip: (req) => process.env.NODE_ENV === 'test',
  validate: { xForwardedForHeader: false },
});

/**
 * Registration rate limiter
 * 3 attempts per hour per IP
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many registration attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitResponse('Too many registration attempts. Please try again later.'),
  skip: (req) => process.env.NODE_ENV === 'test',
  validate: { xForwardedForHeader: false },
});

/**
 * Quote request rate limiter
 * 10 requests per minute per IP
 */
export const quoteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many quote requests. Please wait a moment.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitResponse('Too many quote requests. Please wait a moment.'),
  skip: (req) => process.env.NODE_ENV === 'test',
  validate: { xForwardedForHeader: false },
});

/**
 * Password reset rate limiter
 * 3 requests per 15 minutes per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: 'Too many password reset requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitResponse('Too many password reset requests. Please try again later.'),
  skip: (req) => process.env.NODE_ENV === 'test',
  validate: { xForwardedForHeader: false },
});

/**
 * 2FA verification rate limiter
 * 5 attempts per 5 minutes per user session
 */
export const twoFactorLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: 'Too many 2FA attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.session?.userId || req.ip || 'anonymous',
  handler: createRateLimitResponse('Too many 2FA attempts. Please try again later.'),
  skip: (req) => process.env.NODE_ENV === 'test',
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
});

/**
 * General API rate limiter
 * 100 requests per minute per IP
 */
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitResponse('Too many requests. Please slow down.'),
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/api/health' || !req.path.startsWith('/api');
  },
  validate: { xForwardedForHeader: false },
});

/**
 * Strict rate limiter for sensitive operations
 * 3 requests per minute per user
 */
export const sensitiveOperationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: 'Too many requests for this operation. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.session?.userId || req.ip || 'anonymous',
  handler: createRateLimitResponse('Too many requests for this operation. Please try again later.'),
  skip: (req) => process.env.NODE_ENV === 'test',
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
});

/**
 * Contact form rate limiter
 * 5 submissions per hour per IP
 */
export const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many contact form submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitResponse('Too many contact form submissions. Please try again later.'),
  skip: (req) => process.env.NODE_ENV === 'test',
  validate: { xForwardedForHeader: false },
});

/**
 * Referral form rate limiter
 * 5 submissions per hour per IP
 */
export const referralFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many referral submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitResponse('Too many referral submissions. Please try again later.'),
  skip: (req) => process.env.NODE_ENV === 'test',
  validate: { xForwardedForHeader: false },
});

/**
 * Website email sharing rate limiter
 * 10 emails per hour per user session
 */
export const websiteEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many website emails sent. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.session?.userId || req.ip || 'anonymous',
  handler: createRateLimitResponse('Too many website emails sent. Please try again later.'),
  skip: (req) => process.env.NODE_ENV === 'test',
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
});

export default {
  loginLimiter,
  registrationLimiter,
  quoteLimiter,
  passwordResetLimiter,
  twoFactorLimiter,
  generalApiLimiter,
  sensitiveOperationLimiter,
  contactFormLimiter,
  referralFormLimiter,
  websiteEmailLimiter,
};
