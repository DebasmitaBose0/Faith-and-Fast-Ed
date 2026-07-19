import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
      required: [true, "Address is required"],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity should be at least 1"],
        },
        price: {
          type: Number,
        },
        totalPrice: {
          type: Number,
        },
        images: [
          {
            public_id: {
              type: String,
            },
            url: {
              type: String,
            },
          },
        ],
        selectedColor: {
          type: String,
          default: "",
        },
        selectedSize: {
          type: String,
          default: "",
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: "",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE", "STRIPE"],
      default: "COD",
    },
    upiReference: {
      type: String,
      default: "",
    },
    paymentScreenshot: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
    },
    paymentVerifiedAt: {
      type: Date,
    },
    paymentRejectionReason: {
      type: String,
      default: "",
    },
    // Payment flow: COD introduces a controlled status transition.
    // We keep `paymentStatus` as a payment outcome marker and `orderStatus` as
    // the fulfillment lifecycle marker.
    orderStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },

    // Idempotency key supplied by the frontend to prevent duplicate order
    // creation (e.g. double-click / network retries).
    idempotencyKey: {
      type: String,
      required: false,
      index: false,
    },

    orderHistory: {
      type: [
        {
          status: {
            type: String,
            enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"],
          },
          changedAt: {
            type: Date,
            default: Date.now,
          },
          changedBy: {
            type: String,
          },
          notes: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },
    deliveryDate: { type: String, default: "To be delivered" },
    trackingId: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    lastUpdatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  this.totalAmountWithGST = this.totalAmount + (this.gst || 0);
  this.totalAmountWithShipping = this.totalAmountWithGST + (this.shipping || 0);
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, paymentStatus: 1 });

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
