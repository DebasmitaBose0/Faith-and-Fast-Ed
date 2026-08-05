export const defaultRateLimitConfig = {
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 10,
    envWindowKey: 'RATE_LIMIT_AUTH_WINDOW_MS',
    envMaxKey: 'RATE_LIMIT_AUTH_MAX',
    message:
      'Too many authentication attempts. Please try again after 15 minutes.',
  },
  order: {
    windowMs: 60 * 60 * 1000,
    max: 20,
    envWindowKey: 'RATE_LIMIT_ORDER_WINDOW_MS',
    envMaxKey: 'RATE_LIMIT_ORDER_MAX',
    message: 'Too many orders created from this IP. Please try again later.',
  },
  contact: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    envWindowKey: 'RATE_LIMIT_CONTACT_WINDOW_MS',
    envMaxKey: 'RATE_LIMIT_CONTACT_MAX',
    message: 'Too many contact submissions. Please try again after 15 minutes.',
  },
  general: {
    windowMs: 15 * 60 * 1000,
    max: 2000,
    envWindowKey: 'RATE_LIMIT_GENERAL_WINDOW_MS',
    envMaxKey: 'RATE_LIMIT_GENERAL_MAX',
    message: 'Too many requests, please try again later.',
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000,
    max: 5,
    envWindowKey: 'RATE_LIMIT_PASSWORD_RESET_WINDOW_MS',
    envMaxKey: 'RATE_LIMIT_PASSWORD_RESET_MAX',
    message:
      'Too many password reset attempts. Please try again after an hour.',
  },
};

export default defaultRateLimitConfig;
