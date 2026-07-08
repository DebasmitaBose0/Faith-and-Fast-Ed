import express from "express";
import rateLimit from "express-rate-limit";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import {
  submitContactMessage,
  getContactMessages,
} from "../controllers/supportController.js";

const supportRouter = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many contact submissions. Please try again after 15 minutes.",
    retryAfter: "15m",
  },
});

// Public - anyone (logged in or not) can submit a support message.
supportRouter.post("/contact", contactLimiter, submitContactMessage);

// Admin - list submitted support messages.
supportRouter.get("/contact", auth, admin, getContactMessages);

export default supportRouter;
