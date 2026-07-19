import helmet from "helmet";

const isProduction = process.env.NODE_ENV === "production";
const CSP_REPORT_URI = process.env.CSP_REPORT_URI || "";

const cspDirectives = {
  defaultSrc: ["'self'"],
  baseUri: ["'self'"],
  objectSrc: ["'none'"],
  scriptSrc: [
    "'self'",
    ...(isProduction ? [] : ["'unsafe-eval'"]),
    "https://checkout.stripe.com",
  ],
  scriptSrcAttr: ["'unsafe-inline'"],
  connectSrc: [
    "'self'",
    "https://api.stripe.com",
    "https://api.cloudinary.com",
  ],
  frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https://res.cloudinary.com",
    "https://*.stripe.com",
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  manifestSrc: ["'self'"],
  upgradeInsecureRequests: [],
  ...(CSP_REPORT_URI ? { reportUri: CSP_REPORT_URI } : {}),
};

const securityMiddleware = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: cspDirectives,
      },
      crossOriginEmbedderPolicy: !isProduction ? false : { policy: "require-corp" },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      originAgentCluster: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      hsts: {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true,
      },
      xFrameOptions: { action: "deny" },
      xContentTypeOptions: true,
      xDnsPrefetchControl: { allow: true },
      xXssProtection: true,
    })
  );

  app.use((_req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
  });
};

export default securityMiddleware;
