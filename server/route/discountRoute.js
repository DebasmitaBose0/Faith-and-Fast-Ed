import express from "express";
import {
  createDiscount,
  applyDiscount,
  getAllDiscounts,
  deleteDiscount,
  updateDiscount,
} from "../controllers/discountController.js";

const router = express.Router();

router.post("/create", createDiscount);
router.post("/apply", applyDiscount);
router.get("/all", getAllDiscounts);
router.put("/update/:discountId", updateDiscount);
router.delete("/delete/:discountId", deleteDiscount);

export default router;
