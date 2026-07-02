// Structured logging utility for the backend application
export const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] ${message}`, Object.keys(meta).length ? meta : "");
  },
  error: (message, error = null, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.error(
      `[ERROR] [${timestamp}] ${message}`,
      error ? `| Error: ${error.message}` : "",
      Object.keys(meta).length ? meta : ""
    );
    if (error && error.stack) {
      console.error(error.stack);
    }
  },
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] [${timestamp}] ${message}`, Object.keys(meta).length ? meta : "");
  }
};
