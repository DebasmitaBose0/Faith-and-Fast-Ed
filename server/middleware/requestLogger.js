import logger from "../utils/logger.js";

function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const meta = {
      method,
      url: originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
    };

    if (statusCode >= 500) {
      logger.error(`[${method}] ${originalUrl} -> ${statusCode}`, meta);
    } else if (statusCode >= 400) {
      logger.warn(`[${method}] ${originalUrl} -> ${statusCode}`, meta);
    } else {
      logger.info(`[${method}] ${originalUrl} -> ${statusCode}`, meta);
    }
  });

  next();
}

export default requestLogger;
