import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    selectedColor: {
      type: String,
      required: true,
    },
    selectedSize: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

cartProductSchema.index({ userId: 1 });
cartProductSchema.index({ productId: 1 });
cartProductSchema.index({ userId: 1, productId: 1 });

const CartProductModel = mongoose.model("cartProduct", cartProductSchema);

export default CartProductModel;
