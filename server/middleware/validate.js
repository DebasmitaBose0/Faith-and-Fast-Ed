/**
 * Express middleware for validating request data against a schema object.
 *
 * @param {Object} schema - Schema object with a validate(data) method.
 * @param {string} [target='body'] - Request property to validate ('body', 'query', or 'params').
 * @returns {Function} Express middleware function.
 */
export const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    if (!schema || typeof schema.validate !== 'function') {
      return next();
    }

    const errors = schema.validate(req[target] || {});
    if (errors && errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: true,
        message: errors[0],
        details: errors,
      });
    }

    next();
  };
};

export default validate;
