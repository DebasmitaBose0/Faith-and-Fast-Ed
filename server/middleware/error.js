import ErrorHandler from "../utils/errorHandler.js";
import { errorResponse } from "../utils/responseHelper.js";

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

  errorResponse(res, err.message, err.statusCode);
};

export default errorMiddleware;
