import mongoose from 'mongoose';

const wishListProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const wishListProductModel = mongoose.model(
  'wishListProduct',
  wishListProductSchema
);

export default wishListProductModel;
