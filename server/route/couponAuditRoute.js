import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import { getCouponAuditTrail } from "../controllers/couponAuditController.js";

const router = express.Router();

// Only admin can view coupon/discount audit log
router.get("/logs", auth, admin, getCouponAuditTrail);

export default router;
