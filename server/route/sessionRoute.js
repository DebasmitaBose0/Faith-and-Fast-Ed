import express from "express";
import auth from "../middleware/auth.js";
import {
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
} from "../controllers/sessionController.js";

const sessionRouter = express.Router();

sessionRouter.get("/active", auth, getActiveSessions);
sessionRouter.delete("/revoke/:sessionId", auth, revokeSession);
sessionRouter.delete("/revoke-others", auth, revokeAllOtherSessions);

export default sessionRouter;
