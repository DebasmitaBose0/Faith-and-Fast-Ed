import rateLimit from 'express-rate-limit';
import defaultRateLimitConfig from '../config/rateLimitConfig.js';

/**
 * Creates an express-rate-limit middleware instance based on configuration and optional env overrides.
 *
 * @param {string} name - Name of the rate limiter (e.g. 'auth', 'order', 'contact', 'general', 'passwordReset').
 * @param {Object} [customOptions] - Optional overrides for windowMs, max, message, etc.
 * @returns {Function} Express rate limit middleware function.
 */
export const createLimiter = (name, customOptions = {}) => {
  const baseConfig = defaultRateLimitConfig[name] || {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
  };

  const windowMs =
    customOptions.windowMs ||
    (baseConfig.envWindowKey && process.env[baseConfig.envWindowKey]
      ? parseInt(process.env[baseConfig.envWindowKey], 10)
      : baseConfig.windowMs);

  const max =
    customOptions.max ||
    (baseConfig.envMaxKey && process.env[baseConfig.envMaxKey]
      ? parseInt(process.env[baseConfig.envMaxKey], 10)
      : baseConfig.max);

  const messageText = customOptions.message || baseConfig.message;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: messageText,
    },
    ...customOptions.extraOptions,
  });
};

export const rateLimiters = {
  auth: createLimiter('auth'),
  order: createLimiter('order'),
  contact: createLimiter('contact'),
  general: createLimiter('general'),
  passwordReset: createLimiter('passwordReset'),
};

export const authLimiter = rateLimiters.auth;
export const orderLimiter = rateLimiters.order;
export const contactLimiter = rateLimiters.contact;
export const generalLimiter = rateLimiters.general;
export const passwordResetLimiter = rateLimiters.passwordReset;

export default rateLimiters;
