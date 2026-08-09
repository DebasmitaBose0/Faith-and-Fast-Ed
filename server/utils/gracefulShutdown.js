let serverInstance = null;
const SHUTDOWN_TIMEOUT = 10000;

function shutdown(reason, code = 1) {
  console.error(`[shutdown] reason=${reason} code=${code}`);

  if (!serverInstance) {
    process.exit(code);
  }

  serverInstance.close(() => {
    process.exit(code);
  });

  setTimeout(() => {
    console.error("[shutdown] Forced exit after timeout");
    process.exit(code);
  }, SHUTDOWN_TIMEOUT).unref();
}

export function setupShutdownHandlers(server) {
  serverInstance = server;

  process.on("unhandledRejection", (err) => {
    console.error(`[unhandledRejection] ${err?.message ?? err}`);
    shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (err) => {
    console.error(`[uncaughtException] ${err?.message ?? err}`);
    shutdown("uncaughtException");
  });

  process.on("SIGTERM", () => shutdown("SIGTERM", 0));
  process.on("SIGINT", () => shutdown("SIGINT", 0));
}

export function getShutdownTimeout() {
  return SHUTDOWN_TIMEOUT;
}
