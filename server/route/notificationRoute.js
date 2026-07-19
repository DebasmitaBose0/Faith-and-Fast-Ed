import express from "express";
import { addClient } from "../utils/sseManager.js";

const notificationRouter = express.Router();

notificationRouter.get("/subscribe", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  addClient(res);

  // Send initial message
  res.write("data: Connected to notifications\n\n");
});

export default notificationRouter;
