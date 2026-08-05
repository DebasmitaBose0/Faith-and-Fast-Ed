/**
 * Middleware function that sets security response headers (Permissions-Policy, Cross-Origin-Opener-Policy).
 *
 * @param {Object} _req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const customHeaders = (_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
};

export default customHeaders;
