import crypto from "crypto";
import logger, { requestContextStore } from "../utils/logger.js";

const requestContextMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || req.headers["x-correlation-id"] || crypto.randomUUID();

  req.id = requestId;
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    const store = requestContextStore.getStore() || {};
    const userId = store.userId || req.user?.id || req.user?._id || null;

    logger.info("HTTP Request Completed", {
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${durationMs}ms`,
      userId: userId || undefined,
    });
  });

  requestContextStore.run({ requestId, userId: null }, () => {
    next();
  });
};

export default requestContextMiddleware;
