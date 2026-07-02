import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import CouponAuditModel from "../models/couponAudit.js";

// Fetch audit trail of coupon/discount usage
export const getCouponAuditTrail = catchAsyncErrors(async (req, res) => {
  try {
    const audits = await CouponAuditModel.find()
      .populate("discountId")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: audits.length,
      audits,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve audit trail",
    });
  }
});
