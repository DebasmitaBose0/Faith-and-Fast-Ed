import express from "express";
import auth from "../middleware/auth.js";
import {
  cancelOrder,
  createOrder,
  deleteAllOrders,
  deleteOrder,
  getAllOrders,
  getSingleOrder,
  myOrders,
  updateOrderStatus,
  uploadPaymentScreenshot,
  verifyPayment,
} from "../controllers/orderController.js";
import admin from "../middleware/Admin.js";
import upload from "../middleware/multer.js";
import { getOrderAnalytics } from "../controllers/analyticsController.js";
import { orderLimiter } from "../middleware/rateLimiter.js";

const orderRouter = express.Router();

orderRouter.post("/create", auth, orderLimiter, createOrder);

orderRouter.post(
  "/upload-payment-screenshot",
  auth,
  upload.single("screenshot"),
  uploadPaymentScreenshot
);

orderRouter.put(
  "/admin/verify-payment/:orderId",
  auth,
  admin,

  verifyPayment
);

orderRouter.get("/myorder", auth, myOrders);

orderRouter.get("/get/admin", auth, admin, getAllOrders);

orderRouter.get(
  "/admin/analytics",
  auth,
  admin,
  getOrderAnalytics
);

orderRouter.get("/get/:orderId", auth, getSingleOrder);

orderRouter.put("/admin/update/:orderId", auth, admin, updateOrderStatus);

orderRouter.put("/cancel/:orderId", auth, cancelOrder);

orderRouter.delete("/admin/delete/:orderId", auth, admin, deleteOrder);

orderRouter.delete("/admin/delete-all", auth, admin, deleteAllOrders);

export default orderRouter;
