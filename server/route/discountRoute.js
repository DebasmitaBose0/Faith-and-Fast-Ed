import express from 'express';
import auth from '../middleware/auth.js';
import admin from '../middleware/Admin.js';
import { requirePermission } from '../middleware/permission.js';
import {
  createDiscount,
  applyDiscount,
  getAllDiscounts,
  deleteDiscount,
  updateDiscount,
} from '../controllers/discountController.js';
import { invalidateCache } from '../utils/cache.js';
import validate from '../middleware/validate.js';
import {
  createDiscountSchema,
  applyDiscountSchema,
} from '../validation/discountValidation.js';

const router = express.Router();

const clearProductsCache = async (req, res, next) => {
  await invalidateCache('products:*');
  next();
};

router.post('/create', clearProductsCache, validate(createDiscountSchema), createDiscount);
router.post('/apply', clearProductsCache, validate(applyDiscountSchema), applyDiscount);
router.get('/all', getAllDiscounts);
router.put('/update/:discountId', clearProductsCache, updateDiscount);
router.delete('/delete/:discountId', clearProductsCache, deleteDiscount);

export default router;
