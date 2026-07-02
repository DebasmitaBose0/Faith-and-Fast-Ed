import mongoose from "mongoose";

const couponAuditSchema = new mongoose.Schema(
  {
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["APPLY", "REVERT"],
      default: "APPLY",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const CouponAuditModel = mongoose.model("CouponAudit", couponAuditSchema);

export default CouponAuditModel;
