import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import {
  bulkUpdatePrices,
  bulkToggleAvailability,
} from "../controllers/bulkProductController.js";

const bulkProductRouter = express.Router();

bulkProductRouter.post("/update-prices", auth, admin, bulkUpdatePrices);
bulkProductRouter.post("/toggle-status", auth, admin, bulkToggleAvailability);

export default bulkProductRouter;
