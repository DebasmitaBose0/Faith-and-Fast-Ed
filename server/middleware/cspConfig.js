const isProduction = process.env.NODE_ENV === 'production';
const CSP_REPORT_URI = process.env.CSP_REPORT_URI || '';

/**
 * Builds the Content Security Policy (CSP) directives object.
 *
 * @param {Object} [options={}] - Custom configuration overrides.
 * @returns {Object} CSP directives map.
 */
export const getCspDirectives = (options = {}) => {
  const reportUri =
    options.reportUri !== undefined ? options.reportUri : CSP_REPORT_URI;

  return {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    objectSrc: ["'none'"],
    scriptSrc: [
      "'self'",
      ...(isProduction ? [] : ["'unsafe-eval'"]),
      'https://checkout.stripe.com',
    ],
    scriptSrcAttr: ["'unsafe-inline'"],
    connectSrc: [
      "'self'",
      'https://api.stripe.com',
      'https://api.cloudinary.com',
    ],
    frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https://res.cloudinary.com',
      'https://*.stripe.com',
    ],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    manifestSrc: ["'self'"],
    upgradeInsecureRequests: [],
    ...(reportUri ? { reportUri } : {}),
    ...options.extraDirectives,
  };
};

export const cspDirectives = getCspDirectives();

export default cspDirectives;
