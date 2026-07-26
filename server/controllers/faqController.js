import FAQModel from "../models/faqModel.js";

export const askQuestion = async (req, res) => {
  try {
    const { productId, question } = req.body;

    if (!productId || !question) {
      return res.status(400).json({
        success: false,
        message: "Product ID and question are required.",
      });
    }

    const newFaq = new FAQModel({
      productId,
      userId: req.userId || req.user?._id,
      question,
    });

    await newFaq.save();

    res.status(201).json({
      success: true,
      message: "Your question has been submitted for admin moderation.",
      faq: newFaq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit question.",
    });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { faqId } = req.params;
    const { answer } = req.body;

    const faq = await FAQModel.findById(faqId);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    faq.answer = answer;
    faq.isApproved = true;
    await faq.save();

    res.status(200).json({
      success: true,
      message: "Question answered and approved successfully.",
      faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to answer question.",
    });
  }
};

export const getProductFaq = async (req, res) => {
  try {
    const { productId } = req.params;
    const faqs = await FAQModel.find({ productId, isApproved: true })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product Q&A.",
    });
  }
};

export const getPendingFaqs = async (req, res) => {
  try {
    const faqs = await FAQModel.find({ isApproved: false })
      .populate("productId", "name")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch pending questions.",
    });
  }
};
