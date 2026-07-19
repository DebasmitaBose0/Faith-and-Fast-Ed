import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referralCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    referrerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    rewardPercentage: {
      type: Number,
      required: true,
      default: 5, // 5% discount for referred user, or commission
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usagesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.index({ referralCode: 1 });
referralSchema.index({ referrerId: 1 });

const ReferralModel = mongoose.model("Referral", referralSchema);
export default ReferralModel;
