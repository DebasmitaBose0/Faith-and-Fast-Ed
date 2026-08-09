const errorBuckets = new Map();
const WINDOW_MS = 60000;
const THRESHOLD = 50;

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of errorBuckets) {
    const valid = bucket.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) {
      errorBuckets.delete(key);
    } else {
      errorBuckets.set(key, valid);
    }
  }
}, 30000).unref();

function trackError(type) {
  const now = Date.now();
  const bucket = errorBuckets.get(type) || [];
  bucket.push(now);
  errorBuckets.set(type, bucket);

  const recent = bucket.filter((t) => now - t < WINDOW_MS);
  if (recent.length > THRESHOLD) {
    console.error(
      `[errorMonitor] Error surge detected for "${type}": ${recent.length} occurrences in last 60s`
    );
  }
}

function errorMonitor(err, req, res, next) {
  if (err.statusCode >= 500) {
    trackError("server_error");
  } else if (err.statusCode === 429) {
    trackError("rate_limit");
  } else if (err.statusCode >= 400) {
    trackError("client_error");
  }

  if (err.name === "CastError") trackError("cast_error");
  if (err.code === 11000) trackError("duplicate_key");
  if (err.name === "JsonWebTokenError") trackError("jwt_error");
  if (err.name === "TokenExpiredError") trackError("token_expired");

  next(err);
}

export default errorMonitor;
