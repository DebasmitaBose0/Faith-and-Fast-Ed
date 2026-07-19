import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AsyncLocalStorage } from "async_hooks";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.resolve(__dirname, "../../logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const requestContextStore = new AsyncLocalStorage();

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = process.env.LOG_LEVEL || "debug";

function shouldLog(level) {
  return LOG_LEVELS[level] <= LOG_LEVELS[CURRENT_LEVEL];
}

function writeToFile(logObj) {
  const line = JSON.stringify(logObj) + "\n";
  const date = new Date().toISOString().slice(0, 10);
  const filePath = path.join(logDir, `${date}.log`);
  fs.appendFileSync(filePath, line, "utf-8");
}

const logger = {
  info(message, meta) {
    if (!shouldLog("info")) return;
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
    writeToFile(logObj);
  },

  error(message, errorObj) {
    if (!shouldLog("error")) return;
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
        output += ` | ${errorObj.message}\n${errorObj.stack}`;
      } else {
        output += ` ${JSON.stringify(errorObj)}`;
      }
    }
    console.error(JSON.stringify(logObj));
    writeToFile(logObj);
  },

  warn(message, meta) {
    if (!shouldLog("warn")) return;
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
    writeToFile(logObj);
  },

  debug(message, meta) {
    if (!shouldLog("debug")) return;
    const store = requestContextStore.getStore() || {};
    const logObj = {
      level: "debug",
      timestamp: new Date().toISOString(),
      message,
      requestId: store.requestId,
      userId: store.userId,
      ...meta,
    };
    console.log(JSON.stringify(logObj));
    writeToFile(logObj);
  },
};

export default logger;
