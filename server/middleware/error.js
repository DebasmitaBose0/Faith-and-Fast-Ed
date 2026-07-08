import ErrorHandler from "../utils/errorHandler.js";
import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Json Web Token is invalid, Try again";
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Json Web Token is Expired, Try again";
    err = new ErrorHandler(message, 400);
  }

  logger.error(`Error: ${err.message}`, {
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorMiddleware;
