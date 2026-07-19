import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import { requirePermission } from "../middleware/permission.js";
import {
  createDiscount,
  applyDiscount,
  getAllDiscounts,
  deleteDiscount,
  updateDiscount,
} from "../controllers/discountController.js";
import { invalidateCache } from "../utils/cache.js";

const router = express.Router();

const clearProductsCache = async (req, res, next) => {
  await invalidateCache("products:*");
  next();
};

router.post("/create", clearProductsCache, createDiscount);
router.post("/apply", clearProductsCache, applyDiscount);
router.get("/all", getAllDiscounts);
router.put("/update/:discountId", clearProductsCache, updateDiscount);
router.delete("/delete/:discountId", clearProductsCache, deleteDiscount);

export default router;
