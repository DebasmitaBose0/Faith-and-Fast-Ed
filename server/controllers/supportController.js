import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import SupportMessageModel from "../models/supportModel.js";
import sendEmail from "../config/sendEmail.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactMessage = catchAsyncErrors(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Name is required",
      error: true,
      success: false,
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      message: "Email is required",
      error: true,
      success: false,
    });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      message: "Please provide a valid email address",
      error: true,
      success: false,
    });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({
      message: "Message is required",
      error: true,
      success: false,
    });
  }

  if (message.trim().length > 2000) {
    return res.status(400).json({
      message: "Message cannot exceed 2000 characters",
      error: true,
      success: false,
    });
  }

  const contactMessage = await SupportMessageModel.create({
    name: name.trim(),
    email: email.trim(),
    phone: phone ? String(phone).trim() : "",
    message: message.trim(),
  });

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
    data: {
      id: contactMessage._id,
      createdAt: contactMessage.createdAt,
    },
  });
});

export const getContactMessages = catchAsyncErrors(async (req, res) => {
  const messages = await SupportMessageModel.find().sort({ createdAt: -1 });

  return res.status(200).json({
    message: "Contact messages fetched successfully",
    error: false,
    success: true,
    count: messages.length,
    messages,
  });
});
