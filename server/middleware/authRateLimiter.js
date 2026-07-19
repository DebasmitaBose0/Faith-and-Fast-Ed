import rateLimit from "express-rate-limit";

// Configuration for rate limits. Default is 5 requests per 15 minutes.
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const max = parseInt(process.env.RATE_LIMIT_MAX) || 5;

const authRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    // Log blocked requests for monitoring/metrics
    console.warn(
      `[RATE_LIMIT_BLOCKED] IP: ${req.ip} | Route: ${req.originalUrl} | Time: ${new Date().toISOString()}`
    );

    let retryMessage = "Too many attempts. Please try again later.";
    
    // Calculate time left in seconds
    if (req.rateLimit && req.rateLimit.resetTime) {
      const secondsLeft = Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000);
      if (secondsLeft > 0) {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        if (minutes > 0) {
          retryMessage = `Too many attempts. Please try again in ${minutes}m ${seconds}s.`;
        } else {
          retryMessage = `Too many attempts. Please try again in ${seconds}s.`;
        }
      }
    }

    res.status(options.statusCode).json({
      success: false,
      message: retryMessage,
    });
  },
});

export default authRateLimiter;
