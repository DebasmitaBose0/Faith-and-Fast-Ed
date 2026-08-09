import TicketModel from "../models/ticketModel.js";

export const createTicket = async (req, res) => {
  try {
    const { subject, category, description } = req.body;

    if (!subject || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject, category, and description are required.",
      });
    }

    const ticket = new TicketModel({
      userId: req.userId || req.user?._id,
      subject,
      category,
      description,
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully.",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create support ticket.",
    });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await TicketModel.find({ userId: req.userId || req.user?._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve tickets.",
    });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await TicketModel.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve all tickets.",
    });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, response } = req.body;

    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (status) ticket.status = status;
    if (response !== undefined) ticket.response = response;

    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully.",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update ticket.",
    });
  }
};
