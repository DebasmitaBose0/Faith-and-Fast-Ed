export const securityConfig = {
  helmet: {
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  },
  cors: {
    allowedOrigins: [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_WWW_URL,
      "http://localhost:5173",
    ].filter(Boolean),
  },
  rateLimiting: {
    windowMs: 15 * 60 * 1000,
    max: 2000,
  },
};

export default securityConfig;
