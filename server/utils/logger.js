import { AsyncLocalStorage } from "async_hooks";

export const requestContextStore = new AsyncLocalStorage();

const logger = {
  info(message, meta) {
    const store = requestContextStore.getStore() || {};
    const logObj = {
      level: "info",
      timestamp: new Date().toISOString(),
      message,
      requestId: store.requestId,
      userId: store.userId,
      ...meta,
    };
    console.log(JSON.stringify(logObj));
  },

  error(message, errorObj) {
    const store = requestContextStore.getStore() || {};
    const logObj = {
      level: "error",
      timestamp: new Date().toISOString(),
      message,
      requestId: store.requestId,
      userId: store.userId,
    };

    if (errorObj) {
      if (errorObj instanceof Error) {
        logObj.error = {
          message: errorObj.message,
          stack: errorObj.stack,
        };
      } else {
        logObj.error = errorObj;
      }
    }
    console.error(JSON.stringify(logObj));
  },

  warn(message, meta) {
    const store = requestContextStore.getStore() || {};
    const logObj = {
      level: "warn",
      timestamp: new Date().toISOString(),
      message,
      requestId: store.requestId,
      userId: store.userId,
      ...meta,
    };
    console.warn(JSON.stringify(logObj));
  },
};

export default logger;
