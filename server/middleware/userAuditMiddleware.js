import UserAuditModel from "../models/userAuditModel.js";

const userAuditMiddleware = async (req, res, next) => {
  res.on("finish", async () => {
    // Only audit authenticated write operations and specific profile / checkout URLs
    if (req.userId && ["POST", "PUT", "DELETE"].includes(req.method)) {
      try {
        const actionMap = {
          "/api/order/create": "Placed Order",
          "/api/user/update-password": "Updated Password",
          "/api/user/update-profile": "Updated Profile Details",
        };

        const action = actionMap[req.originalUrl] || `${req.method} request on ${req.originalUrl}`;

        await UserAuditModel.create({
          userId: req.userId,
          action,
          method: req.method,
          url: req.originalUrl,
          ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
          userAgent: req.headers["user-agent"] || "Unknown",
        });
      } catch (err) {
        console.error("Audit trail failed:", err);
      }
    }
  });

  next();
};

export default userAuditMiddleware;
