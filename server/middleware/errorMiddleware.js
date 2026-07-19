import ErrorHandler from "../utils/errorHandler.js";
import logger from "../utils/logger.js";
import { mapMessageToErrorCode } from "../utils/responseHelper.js";

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  let code = err.code || "INTERNAL_SERVER_ERROR";

  logger.error(`${req.method} ${req.originalUrl} ${err.statusCode}`, err);

  // Wrong Mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
    code = "RESOURCE_NOT_FOUND";
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
    code = "DUPLICATE_KEY_ERROR";
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again `;
    err = new ErrorHandler(message, 400);
    code = "AUTH_INVALID_TOKEN";
  }

  // JWT EXPIRE error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, Try again `;
    err = new ErrorHandler(message, 400);
    code = "AUTH_TOKEN_EXPIRED";
  }

  // Fallback for code mapping
  if (code === "INTERNAL_SERVER_ERROR" || typeof code === "number") {
    code = mapMessageToErrorCode(err.message);
  }

  res.status(err.statusCode).json({
    success: false,
    error: {
      code,
      message: err.message,
    },
  });
};

export default errorMiddleware;
