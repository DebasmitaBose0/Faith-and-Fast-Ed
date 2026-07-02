import ErrorHandler from "./errorHandler.js";

export class BadRequestError extends ErrorHandler {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class NotFoundError extends ErrorHandler {
  constructor(message = "Resource Not Found") {
    super(message, 404);
  }
}

export class UnauthorizedError extends ErrorHandler {
  constructor(message = "Unauthorized Access") {
    super(message, 401);
  }
}

export class ForbiddenError extends ErrorHandler {
  constructor(message = "Forbidden Access") {
    super(message, 403);
  }
}
