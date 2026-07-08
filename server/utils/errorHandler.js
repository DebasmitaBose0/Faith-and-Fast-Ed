class ErrorHandler extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || "UNKNOWN_ERROR";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function createError(message, statusCode, errorCode) {
  return new ErrorHandler(message, statusCode, errorCode);
}

export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE_KEY: "DUPLICATE_KEY",
  RATE_LIMIT: "RATE_LIMIT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  PAYMENT_ERROR: "PAYMENT_ERROR",
  INVALID_OPERATION: "INVALID_OPERATION",
};

export default ErrorHandler;
