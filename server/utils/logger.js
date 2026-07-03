const logger = {
  info(message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    console.log(`[INFO] ${timestamp} ${message}${metaStr}`);
  },

  error(message, errorObj) {
    const timestamp = new Date().toISOString();
    let output = `[ERROR] ${timestamp} ${message}`;
    if (errorObj) {
      if (errorObj instanceof Error) {
        output += ` | ${errorObj.message}\n${errorObj.stack}`;
      } else {
        output += ` ${JSON.stringify(errorObj)}`;
      }
    }
    console.error(output);
  },

  warn(message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    console.warn(`[WARN] ${timestamp} ${message}${metaStr}`);
  },
};

export default logger;
