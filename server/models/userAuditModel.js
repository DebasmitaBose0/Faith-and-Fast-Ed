import mongoose from "mongoose";

const userAuditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    method: {
      type: String,
    },
    url: {
      type: String,
    },
    ipAddress: {
      type: String,
      default: "Unknown",
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
  },
  {
    timestamps: true,
  }
);

userAuditSchema.index({ userId: 1 });
userAuditSchema.index({ createdAt: -1 });

const UserAuditModel = mongoose.model("UserAudit", userAuditSchema);
export default UserAuditModel;
