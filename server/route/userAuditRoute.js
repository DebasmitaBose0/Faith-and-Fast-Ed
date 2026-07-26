import express from "express";
import auth from "../middleware/auth.js";
import { getMyLogs } from "../controllers/userAuditController.js";

const userAuditRouter = express.Router();

userAuditRouter.get("/logs", auth, getMyLogs);

export default userAuditRouter;
