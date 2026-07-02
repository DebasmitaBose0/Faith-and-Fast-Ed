import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import upload from "../middleware/multer.js";
import {
  getPaymentSettings,
  updatePaymentSettings,
} from "../controllers/paymentSettingsController.js";

const paymentSettingRouter = express.Router();

paymentSettingRouter.get("/get", getPaymentSettings);
paymentSettingRouter.post(
  "/update",
  auth,
  admin,
  upload.single("qrCode"),
  updatePaymentSettings
);

export default paymentSettingRouter;
