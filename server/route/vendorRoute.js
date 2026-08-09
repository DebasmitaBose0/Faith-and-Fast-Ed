import express from "express";
import { registerVendor } from "../controllers/vendorController.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.post("/register", auth, registerVendor);

export default router;
