import os from "os";
import logger from "./logger.js";

const THRESHOLDS = {
  memoryPercent: 90,
  cpuLoad: 80,
};

let intervalHandle = null;

function getMemoryUsagePercent() {
  return Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);
}

function checkSystemHealth() {
  const memPercent = getMemoryUsagePercent();

  if (memPercent > THRESHOLDS.memoryPercent) {
    logger.warn("System memory usage exceeds threshold", {
      memoryUsagePercent: memPercent,
      threshold: THRESHOLDS.memoryPercent,
      freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
    });
  }
}

export function startMonitoring(intervalMs = 300000) {
  if (intervalHandle) {
    logger.warn("System monitor is already running");
    return;
  }

  logger.info(
    `Starting system monitoring with interval ${intervalMs}ms`
  );
  checkSystemHealth();
  intervalHandle = setInterval(checkSystemHealth, intervalMs);
  intervalHandle.unref();
}

export function stopMonitoring() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info("System monitoring stopped");
  }
}
