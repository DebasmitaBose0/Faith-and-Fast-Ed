import express from 'express';
import auth from '../middleware/auth.js';
import admin from '../middleware/Admin.js';
import upload from '../middleware/multer.js';
import {
  getPaymentSettings,
  updatePaymentSettings,
} from '../controllers/paymentSettingsController.js';

const paymentSettingsRouter = express.Router();

// Public — checkout reads UPI ID + QR
paymentSettingsRouter.get('/', getPaymentSettings);

// Admin — configure UPI ID + upload QR image
paymentSettingsRouter.put(
  '/admin/update',
  auth,
  admin,
  upload.single('qrCode'),
  updatePaymentSettings
);

export default paymentSettingsRouter;
