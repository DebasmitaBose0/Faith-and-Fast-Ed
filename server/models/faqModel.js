import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    answer: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false, // Moderated by admin
    },
  },
  {
    timestamps: true,
  }
);

faqSchema.index({ productId: 1 });
faqSchema.index({ isApproved: 1 });

const FAQModel = mongoose.model("FAQ", faqSchema);
export default FAQModel;
