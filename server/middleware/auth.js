import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import SessionModel from "../models/sessionModel.js";
import { requestContextStore } from "../utils/logger.js";

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Please login again" });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session has been revoked
    const session = await SessionModel.findOne({ token, isRevoked: false });
    if (!session) {
      return res.status(401).json({ success: false, code: "AUTH_TOKEN_EXPIRED", message: "Session expired or revoked" });
    }
    
    req.userId = decoded.id;
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    const store = requestContextStore.getStore();
    if (store) {
      store.userId = req.user.id || req.user._id;
    }

    next();
  } catch (error) {
    console.warn("JWT verification failed:", error.name);
    if (error.name === "JsonWebTokenError") {
      return res
        .status(400)
        .json({ success: false, message: "Please login again" });
    }

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired, please login again" });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

export default auth;
