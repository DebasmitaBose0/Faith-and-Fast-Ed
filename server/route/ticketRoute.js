import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/Admin.js";
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
} from "../controllers/ticketController.js";

const ticketRouter = express.Router();

ticketRouter.post("/create", auth, createTicket);
ticketRouter.get("/my-tickets", auth, getMyTickets);
ticketRouter.get("/all", auth, admin, getAllTickets);
ticketRouter.put("/update/:ticketId", auth, admin, updateTicketStatus);

export default ticketRouter;
