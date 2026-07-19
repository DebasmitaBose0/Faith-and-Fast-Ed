import { sendSuccess, sendError, mapMessageToErrorCode } from "../utils/responseHelper.js";

const responseWrapper = (req, res, next) => {
  // Attach helper methods directly to the res object for convenience
  res.sendSuccess = (data, meta = null) => sendSuccess(res, data, meta);
  res.sendError = (statusCode, code, message, details = null) => sendError(res, statusCode, code, message, details);

  const originalJson = res.json;

  res.json = function (body) {
    // If the body is already in the standardized format, send it as-is
    const isStandardSuccess = body && body.success === true && body.hasOwnProperty("data") && !body.hasOwnProperty("error");
    const isStandardError = body && body.success === false && body.error && typeof body.error === "object" && body.error.hasOwnProperty("code");

    if (isStandardSuccess || isStandardError) {
      return originalJson.call(this, body);
    }

    // Determine if it's a success or error response from the body properties
    // In the legacy code: success is true/false, or error is true/false.
    const isSuccess = body && (body.success === true || body.error === false || (body.success === undefined && body.error === undefined));

    if (isSuccess) {
      let data = body;
      let meta = null;

      if (body && typeof body === "object") {
        const { success, error, ...rest } = body;
        
        // If there's already a 'data' key inside body, use it as the main data
        // and extract any pagination/meta fields if they exist
        if (rest.hasOwnProperty("data")) {
          data = rest.data;
          
          // Move other top-level keys to meta or leave them if they represent metadata
          const { meta: bodyMeta, ...otherKeys } = rest;
          if (Object.keys(otherKeys).length > 0 || bodyMeta) {
            meta = {
              ...bodyMeta,
              ...otherKeys,
            };
          }
        } else {
          // If 'success' or 'error' exists but no 'data' key, wrap the other fields in 'data'
          if (body.hasOwnProperty("success") || body.hasOwnProperty("error")) {
            data = rest;
          }
        }
      }

      const standardized = {
        success: true,
        data,
      };

      if (meta && Object.keys(meta).length > 0) {
        standardized.meta = meta;
      }

      return originalJson.call(this, standardized);
    } else {
      // Failure response
      let message = "An error occurred";
      let code = "BAD_REQUEST";
      let details = null;

      if (body && typeof body === "object") {
        message = body.message || message;
        code = body.code || mapMessageToErrorCode(message);
        
        const { success, error, message: msg, code: cd, ...rest } = body;
        if (Object.keys(rest).length > 0) {
          details = rest;
        }
      } else if (typeof body === "string") {
        message = body;
        code = mapMessageToErrorCode(body);
      }

      const standardized = {
        success: false,
        error: {
          code,
          message,
        },
      };

      if (details) {
        standardized.error.details = details;
      }

      return originalJson.call(this, standardized);
    }
  };

  next();
};

export default responseWrapper;
