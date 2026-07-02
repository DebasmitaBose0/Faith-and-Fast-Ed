import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import SupportMessageModel from "../models/supportModel.js";
import sendEmail from "../config/sendEmail.js";
import { validateSupportMessage } from "../utils/supportValidator.js";

export const submitContactMessage = catchAsyncErrors(async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Validation
  const validation = validateSupportMessage({ name, email, message });
  if (!validation.valid) {
    return res.status(400).json({
      message: validation.message,
      error: true,
      success: false,
    });
  }

  // Store
  const contactMessage = await SupportMessageModel.create({
    name: name.trim(),
    email: email.trim(),
    phone: phone ? String(phone).trim() : "",
    message: message.trim(),
  });

  // Admin Notification
  if (process.env.ADMIN_EMAIL) {
    sendEmail({
      sendTo: process.env.ADMIN_EMAIL,
      subject: `New Support Message from ${contactMessage.name}`,
      html: `
        <h2>New Customer Support Message</h2>
        <p><strong>Name:</strong> ${contactMessage.name}</p>
        <p><strong>Email:</strong> ${contactMessage.email}</p>
        <p><strong>Phone:</strong> ${contactMessage.phone || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${contactMessage.message}</p>
      `,
    });
  }

  return res.status(201).json({
    message: "Your message has been sent successfully. We'll get back to you soon!",
    error: false,
    success: true,
  });
});

export const getContactMessages = catchAsyncErrors(async (req, res) => {
  const messages = await SupportMessageModel.find().sort({ createdAt: -1 });

  return res.status(200).json({
    message: "Support messages fetched successfully",
    error: false,
    success: true,
    count: messages.length,
    messages,
  });
});
