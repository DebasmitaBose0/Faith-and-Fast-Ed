import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.resolve(__dirname, "../../logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = process.env.LOG_LEVEL || "debug";

function formatTimestamp() {
  return new Date().toISOString();
}

function writeToFile(level, message, meta) {
  const entry = {
    timestamp: formatTimestamp(),
    level,
    message,
    ...(meta && Object.keys(meta).length ? { meta } : {}),
  };
  const line = JSON.stringify(entry) + "\n";
  const date = new Date().toISOString().slice(0, 10);
  const filePath = path.join(logDir, `${date}.log`);
  fs.appendFileSync(filePath, line, "utf-8");
}

function shouldLog(level) {
  return LOG_LEVELS[level] <= LOG_LEVELS[CURRENT_LEVEL];
}

const logger = {
  error(msg, meta) {
    if (!shouldLog("error")) return;
    console.error(`[ERROR] ${msg}`, meta || "");
    writeToFile("error", msg, meta);
  },

  warn(msg, meta) {
    if (!shouldLog("warn")) return;
    console.warn(`[WARN] ${msg}`, meta || "");
    writeToFile("warn", msg, meta);
  },

  info(msg, meta) {
    if (!shouldLog("info")) return;
    console.log(`[INFO] ${msg}`, meta || "");
    writeToFile("info", msg, meta);
  },

  debug(msg, meta) {
    if (!shouldLog("debug")) return;
    console.log(`[DEBUG] ${msg}`, meta || "");
    writeToFile("debug", msg, meta);
  },
};

export default logger;
