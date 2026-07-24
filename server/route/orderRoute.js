import express from 'express';
import auth from '../middleware/auth.js';
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
} from '../controllers/orderController.js';
import admin from '../middleware/Admin.js';
import upload from '../middleware/multer.js';
import { getOrderAnalytics } from '../controllers/analyticsController.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import { cacheMiddleware, invalidateCache } from '../utils/cache.js';

const orderRouter = express.Router();

const clearOrderAnalyticsCache = async (req, res, next) => {
  await invalidateCache('orders:analytics*');
  next();
};

orderRouter.post('/create', auth, clearOrderAnalyticsCache, orderLimiter, createOrder);

orderRouter.post(
  '/upload-payment-screenshot',
  auth,
  upload.single('screenshot'),
  uploadPaymentScreenshot
);

orderRouter.put(
  '/admin/verify-payment/:orderId',
  auth,
  admin,
  clearOrderAnalyticsCache,
  verifyPayment
);

orderRouter.get('/myorder', auth, myOrders);

orderRouter.get('/get/admin', auth, admin, getAllOrders);

orderRouter.get(
  '/admin/analytics',
  auth,
  admin,
  cacheMiddleware('orders:analytics', 3600),
  getOrderAnalytics
);

orderRouter.get('/get/:orderId', auth, getSingleOrder);

orderRouter.put('/admin/update/:orderId', auth, admin, clearOrderAnalyticsCache, updateOrderStatus);

orderRouter.put('/cancel/:orderId', auth, clearOrderAnalyticsCache, cancelOrder);

orderRouter.delete('/admin/delete/:orderId', auth, admin, clearOrderAnalyticsCache, deleteOrder);

orderRouter.delete('/admin/delete-all', auth, admin, clearOrderAnalyticsCache, deleteAllOrders);

export default orderRouter;
