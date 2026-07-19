import express from "express";
import { getHealth, getReadiness } from "../controllers/healthController.js";

const healthRouter = express.Router();

healthRouter.get("/health", getHealth);
healthRouter.get("/readiness", getReadiness);

export default healthRouter;
