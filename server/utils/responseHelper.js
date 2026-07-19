export const mapMessageToErrorCode = (message) => {
  if (!message) return "INTERNAL_ERROR";
  const msg = message.toLowerCase();
  
  if (msg.includes("cast to objectid failed") || msg.includes("invalid objectid") || msg.includes("casterror")) return "RESOURCE_NOT_FOUND";
  if (msg.includes("not registered") || msg.includes("user not found") || msg.includes("user is not found")) return "USER_NOT_FOUND";
  if (msg.includes("password is incorrect") || msg.includes("invalid password") || msg.includes("incorrect password") || msg.includes("credentials")) return "INVALID_CREDENTIALS";
  if (msg.includes("please login again") || msg.includes("token is invalid") || msg.includes("invalid token")) return "AUTH_INVALID_TOKEN";
  if (msg.includes("token expired") || msg.includes("token is expired") || msg.includes("token expired")) return "AUTH_TOKEN_EXPIRED";
  if (msg.includes("not authorized") || msg.includes("not admin")) return "NOT_AUTHORIZED";
  if (msg.includes("product not found") || msg.includes("product is not found")) return "PRODUCT_NOT_FOUND";
  if (msg.includes("invalid otp") || msg.includes("incorrect otp")) return "INVALID_OTP";
  if (msg.includes("otp expired") || msg.includes("otp has expired")) return "OTP_EXPIRED";
  if (msg.includes("required fields") || msg.includes("validation failed") || msg.includes("please enter all")) return "VALIDATION_ERROR";
  if (msg.includes("duplicate") || msg.includes("already exists")) return "DUPLICATE_KEY_ERROR";
  if (msg.includes("too many requests") || msg.includes("too many attempts")) return "TOO_MANY_REQUESTS";
  
  return "BAD_REQUEST";
};

export const sendSuccess = (res, data, meta = null) => {
  const payload = {
    success: true,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(200).json(payload);
};

export const sendError = (res, statusCode, code, message, details = null) => {
  let errorCode = code;
  if (!code || code === "SERVER_ERROR" || code === "INTERNAL_ERROR" || code === "BAD_REQUEST") {
    errorCode = mapMessageToErrorCode(message);
  }
  const payload = {
    success: false,
    error: {
      code: errorCode,
      message,
    },
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
};
