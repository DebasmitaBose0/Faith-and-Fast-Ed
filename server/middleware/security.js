import helmet from 'helmet';
import { getHelmetOptions } from './helmetOptions.js';
import customHeaders from './customHeaders.js';

/**
 * Creates a composed security middleware instance.
 *
 * @param {Object} [options={}] - Custom configuration options.
 * @returns {Function} Express middleware function.
 */
export const createSecurityMiddleware = (options = {}) => {
  const helmetMiddleware = helmet(getHelmetOptions(options));

  return (req, res, next) => {
    helmetMiddleware(req, res, (err) => {
      if (err) return next(err);
      customHeaders(req, res, next);
    });
  };
};

/**
 * Default composed security middleware.
 * Supports both function invocation `securityMiddleware(app)` and Express middleware `app.use(securityMiddleware)`.
 */
const securityMiddleware = (appOrReq, res, next) => {
  if (appOrReq && typeof appOrReq.use === 'function') {
    appOrReq.use(helmet(getHelmetOptions()));
    appOrReq.use(customHeaders);
    return;
  }

  const middleware = createSecurityMiddleware();
  return middleware(appOrReq, res, next);
};

export default securityMiddleware;
