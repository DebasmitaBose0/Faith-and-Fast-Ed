import DiscountModel from "../models/discountModel.js";
import CouponAuditModel from "../models/couponAudit.js";

// Admin
export const createDiscount = async (req, res) => {
  try {
    const {
      name,
      discountType,
      discountValue,
      applicableProducts,
      totalUsersAllowed,
      startDate,
      endDate,
    } = req.body;

    if (
      !name ||
      !discountType ||
      !discountValue ||
      !totalUsersAllowed ||
      !startDate ||
      !endDate
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!["FIXED", "PERCENTAGE"].includes(discountType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid discount type" });
    }

    if (discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0",
      });
    }

    // A percentage discount cannot exceed 100. This mirrors the same guard
    // already enforced in updateDiscount, so create and update stay consistent.
    // FIXED discounts legitimately have no upper cap.
    if (discountType === "PERCENTAGE" && Number(discountValue) > 100) {
      return res.status(400).json({
        success: false,
        message: "A percentage discount cannot exceed 100",
      });
    }

    const newDiscount = new DiscountModel({
      name,
      discountType,
      discountValue,
      applicableProducts,
      totalUsersAllowed,
      startDate,
      endDate,
    });

    await newDiscount.save();
    res.status(201).json({
      success: true,
      message: "Discount Created Successfully",
      discount: newDiscount,
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin — update an existing discount in place. Mirrors createDiscount's
// validation but only applies the fields that are provided, so a partial
// edit (e.g. just extending endDate or toggling isActive) is supported.
export const updateDiscount = async (req, res) => {
  try {
    const { discountId } = req.params;

    const discount = await DiscountModel.findById(discountId);
    if (!discount) {
      return res
        .status(404)
        .json({ success: false, message: "Discount not found" });
    }

    const {
      name,
      discountType,
      discountValue,
      applicableProducts,
      totalUsersAllowed,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // Validate discountType only if it's being changed.
    if (discountType !== undefined && !["FIXED", "PERCENTAGE"].includes(discountType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid discount type" });
    }

    // Validate discountValue only if it's being changed.
    if (discountValue !== undefined && Number(discountValue) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0",
      });
    }

    // A percentage discount cannot exceed 100.
    const effectiveType = discountType ?? discount.discountType;
    const effectiveValue =
      discountValue !== undefined ? Number(discountValue) : discount.discountValue;
    if (effectiveType === "PERCENTAGE" && effectiveValue > 100) {
      return res.status(400).json({
        success: false,
        message: "A percentage discount cannot exceed 100",
      });
    }

    // totalUsersAllowed cannot be set below the number who have already used it.
    if (
      totalUsersAllowed !== undefined &&
      Number(totalUsersAllowed) < discount.usedBy.length
    ) {
      return res.status(400).json({
        success: false,
        message: `totalUsersAllowed cannot be less than the ${discount.usedBy.length} user(s) who already redeemed this discount`,
      });
    }

    // Apply only the provided fields.
    if (name !== undefined) discount.name = name;
    if (discountType !== undefined) discount.discountType = discountType;
    if (discountValue !== undefined) discount.discountValue = Number(discountValue);
    if (applicableProducts !== undefined) discount.applicableProducts = applicableProducts;
    if (totalUsersAllowed !== undefined) discount.totalUsersAllowed = Number(totalUsersAllowed);
    if (startDate !== undefined) discount.startDate = startDate;
    if (endDate !== undefined) discount.endDate = endDate;
    if (isActive !== undefined) discount.isActive = Boolean(isActive);

    await discount.save();

    res.status(200).json({
      success: true,
      message: "Discount Updated Successfully",
      discount,
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const applyDiscount = async (req, res) => {
  try {
    const { userId, couponCode, originalPrice } = req.body;

    if (!userId || !couponCode || !originalPrice) {
      return res.status(400).json({
        success: false,
        message: "User ID, coupon code, and original price are required",
      });
    }

    const discount = await DiscountModel.findOne({
      name: couponCode,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      isActive: true,
    });

    if (!discount) {
      return res.status(400).json({
        success: false,
        message: "No active discount found with this coupon code",
      });
    }

    if (discount.usedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User already used this discount",
      });
    }

    if (discount.usedBy.length >= discount.totalUsersAllowed) {
      discount.isActive = false;
      await discount.save();
      return res.status(400).json({
        success: false,
        message: "Discount limit reached",
      });
    }

    let discountAmount =
      discount.discountType === "FIXED"
        ? discount.discountValue
        : (originalPrice * discount.discountValue) / 100;

    discountAmount = Math.min(discountAmount, originalPrice);
    const newPrice = Math.max(originalPrice - discountAmount, 0);

    discount.usedBy.push(userId);
    await discount.save();

    // Create audit log entry
    try {
      await CouponAuditModel.create({
        discountId: discount._id,
        userId,
        action: "APPLY",
        ipAddress: req.ip || "",
      });
    } catch (auditError) {
      // Non-blocking: fail-safe if audit creation fails
    }

    return res.status(200).json({
      success: true,
      message: "Discount Applied Successfully!",
      discount: {
        name: discount.name,
        type: discount.discountType,
        value: discount.discountValue,
      },
      discountAmount,
      newPrice,
    });
  } catch (error) {
    console.error("Error applying discount:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin
export const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await DiscountModel.find().populate(
      "applicableProducts",
      "name price"
    );
    res.status(200).json({ success: true, discounts });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin
export const deleteDiscount = async (req, res) => {
  try {
    const { discountId } = req.params;

    if (!discountId) {
      return res
        .status(400)
        .json({ success: false, message: "Discount ID is required" });
    }

    const discount = await DiscountModel.findByIdAndDelete(discountId);
    if (!discount) {
      return res
        .status(404)
        .json({ success: false, message: "Discount not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Discount Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
