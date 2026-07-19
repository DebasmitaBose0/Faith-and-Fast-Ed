import mongoose from "mongoose";
import os from "os";
import process from "process";

function getUptime() {
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

export const getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const healthData = {
    status: dbState === 1 ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: getUptime(),
    database: {
      status: dbStatus[dbState] || "unknown",
      state: dbState,
    },
    system: {
      memory: {
        free: Math.round(os.freemem() / 1024 / 1024) + "MB",
        total: Math.round(os.totalmem() / 1024 / 1024) + "MB",
        usagePercent: Math.round(
          ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
        ),
      },
      cpu: os.cpus().length + " cores",
      platform: os.platform(),
      uptime: Math.floor(os.uptime() / 3600) + "h",
    },
    environment: process.env.NODE_ENV || "development",
  };

  const statusCode = dbState === 1 ? 200 : 503;
  res.status(statusCode).json(healthData);
};

export const getReadiness = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const checks = {
    database: dbState === 1,
  };

  const allReady = Object.values(checks).every(Boolean);

  res.status(allReady ? 200 : 503).json({
    ready: allReady,
    checks,
    timestamp: new Date().toISOString(),
  });
};
