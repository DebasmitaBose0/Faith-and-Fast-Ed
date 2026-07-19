import express from "express";
import auth from "../middleware/auth.js";
import {
  createReferralCode,
  validateReferralCode,
} from "../controllers/referralController.js";

const referralRouter = express.Router();

referralRouter.post("/create", auth, createReferralCode);
referralRouter.get("/validate/:code", auth, validateReferralCode);

export default referralRouter;
