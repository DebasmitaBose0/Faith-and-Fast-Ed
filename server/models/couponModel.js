import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['FIXED', 'PERCENTAGE'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const CouponModel = mongoose.model('Coupon', couponSchema);

export default CouponModel;
