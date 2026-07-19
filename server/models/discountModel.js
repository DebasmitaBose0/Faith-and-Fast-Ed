import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    discountType: {
      type: String,
      enum: ["FIXED", "PERCENTAGE"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    applicableProducts: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
    totalUsersAllowed: { type: Number, required: true },
    usedBy: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    lastUpdatedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const DiscountModel = mongoose.model("Discount", discountSchema);

export default DiscountModel;
