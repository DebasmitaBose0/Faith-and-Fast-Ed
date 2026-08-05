import { getCspDirectives } from './cspConfig.js';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Returns configuration options for Helmet middleware.
 *
 * @param {Object} [options={}] - Custom helmet options overrides.
 * @returns {Object} Helmet options object.
 */
export const getHelmetOptions = (options = {}) => {
  const directives =
    options.cspDirectives || getCspDirectives(options.cspOptions);

  return {
    contentSecurityPolicy: {
      useDefaults: false,
      directives,
    },
    crossOriginEmbedderPolicy: !isProduction
      ? false
      : { policy: 'require-corp' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    originAgentCluster: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
    xFrameOptions: { action: 'deny' },
    xContentTypeOptions: true,
    xDnsPrefetchControl: { allow: true },
    xXssProtection: true,
    ...options.helmetOverrides,
  };
};

export const helmetOptions = getHelmetOptions();

export default helmetOptions;
