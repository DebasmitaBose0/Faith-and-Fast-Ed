import Stripe from "stripe";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import OrderModel from "../models/orderModel.js";
import ProductModel from "../models/productModel.js";
import UserModel from "../models/userModel.js";
import AddressModel from "../models/addressModel.js";
import sendEmail from "../config/sendEmail.js";
import generateReceiptHTML from "../utils/generateReceipt.js";

// Stripe is initialised lazily so the server can still boot in environments
// where STRIPE_SECRET_KEY is not configured (e.g. a contributor who only works
// on non-payment features). The key is read from the environment, which is how
// the same code switches between test mode (sk_test_...) and live mode
// (sk_live_...) — see PAYMENT_MODE_README.md.
let stripeClient = null;
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};

// Stripe requires ISO 3166-1 alpha-2 country codes (e.g. "IN"), but addresses
// in this app store the country as a display name ("India" by default). This
// maps the common names we expect to their ISO codes. If a value is already a
// 2-letter code it is used as-is; anything unrecognised falls back to "IN",
// since this is an India-based store (INR pricing, 10-digit mobiles, pincodes,
// and an "India" country default). India compliance specifically needs "IN".
const COUNTRY_NAME_TO_ISO = {
  india: "IN",
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  canada: "CA",
  australia: "AU",
  "united arab emirates": "AE",
  uae: "AE",
  singapore: "SG",
  germany: "DE",
  france: "FR",
  netherlands: "NL",
  "new zealand": "NZ",
};

const toISOCountry = (country) => {
  if (!country) return "IN";
  const value = String(country).trim();
  if (/^[A-Za-z]{2}$/.test(value)) return value.toUpperCase();
  return COUNTRY_NAME_TO_ISO[value.toLowerCase()] || "IN";
};

// Recompute the order total on the server from the live product prices so the
// amount charged can never be tampered with from the client. Mirrors the price
// fields the rest of the order flow relies on. Returns the amount in the major
// currency unit (e.g. rupees); the caller converts to the smallest unit for
// Stripe.
const computeServerAmount = async (products, discountAmount) => {
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("No products provided");
  }

  let subtotal = 0;
  for (const item of products) {
    if (!item || !item.product) {
      throw new Error("Invalid product entry");
    }
    const dbProduct = await ProductModel.findById(item.product);
    if (!dbProduct) {
      throw new Error("Product not found");
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid quantity");
    }
    subtotal += dbProduct.price * quantity;
  }

  const discount = Number(discountAmount) || 0;
  const total = Math.max(subtotal - discount, 0);
  return Math.round(total);
};

// Step 1 of the Stripe flow. The client calls this with the cart contents; the
// server computes the authoritative amount, creates a PaymentIntent in the
// configured currency, and returns only the clientSecret. No order is created
// here — the order is created in confirmStripePayment, after the payment has
// actually succeeded.
export const createPaymentIntent = catchAsyncErrors(async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message:
        "Stripe is not configured on the server. Set STRIPE_SECRET_KEY to enable card payments.",
    });
  }

  try {
    const { products, discountAmount, addressId } = req.body;

    const amountMajor = await computeServerAmount(products, discountAmount);
    if (amountMajor <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Order amount must be greater than zero" });
    }

    // India Stripe export compliance requires a shipping name + address on the
    // PaymentIntent, so the delivery address is mandatory for card payments.
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "A delivery address is required for card payments",
      });
    }

    const address = await AddressModel.findById(addressId);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery address not found" });
    }

    const currency = process.env.STRIPE_CURRENCY || "inr";
    const itemCount = products.reduce(
      (sum, item) => sum + (Number(item?.quantity) || 0),
      0
    );

    // India regulations require export card transactions to carry a description
    // and a customer name + address. The description is set here and the
    // customer's name + shipping address are attached below; the billing
    // address travels with the card from the client (billing_details).
    const description = `Faith-and-Fast order - ${itemCount} item(s)`;
    const shipping = {
      name: req.user?.name || "Customer",
      phone: address.mobile ? String(address.mobile) : undefined,
      address: {
        line1: address.address_line,
        city: address.city,
        state: address.state,
        postal_code: address.pincode,
        country: toISOCountry(address.country),
      },
    };

    // Stripe expects the amount in the smallest currency unit (paise for INR,
    // cents for USD), hence the * 100.
    // Extract and validate user ID
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is missing in request" });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountMajor * 100,
      currency,
      description,
      shipping,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(userId),
        discountAmount: String(Number(discountAmount) || 0),
      },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountMajor,
      currency,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Step 2 of the Stripe flow. The client calls this only after Stripe.js reports
// the card payment succeeded, passing the paymentIntentId. The server
// independently re-fetches the PaymentIntent from Stripe and verifies its
// status is "succeeded" before creating the order — so the order can never be
// created for an unpaid or failed intent, even if the client lies. The order is
// stored with paymentStatus COMPLETED and the Stripe transaction id.
export const confirmStripePayment = catchAsyncErrors(async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message:
        "Stripe is not configured on the server. Set STRIPE_SECRET_KEY to enable card payments.",
    });
  }

  try {
    const { paymentIntentId, addressId, products, couponCode } = req.body;

    if (!paymentIntentId) {
      return res
        .status(400)
        .json({ success: false, message: "paymentIntentId is required" });
    }

    // Re-verify with Stripe — never trust the client's word that payment
    // succeeded.
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment has not been completed successfully",
      });
    }

    // Guard against an intent being replayed for a second order.
    const existing = await OrderModel.findOne({
      stripePaymentIntentId: paymentIntentId,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An order already exists for this payment",
      });
    }

    // The PaymentIntent is the source of truth for who paid and how much; the
    // request body is attacker-controllable and must not be trusted for these.
    // Verify the authenticated user matches the user the intent was created for
    // (createPaymentIntent stores it in metadata.userId).
    const authUserId = req.user?._id || req.user?.id;
    if (
      !authUserId ||
      String(paymentIntent.metadata?.userId || "") !== String(authUserId)
    ) {
      return res.status(403).json({
        success: false,
        message: "This payment does not belong to the authenticated user",
      });
    }

    // Authoritative amount actually charged by Stripe, converted back from the
    // smallest currency unit.
    const verifiedAmount = paymentIntent.amount / 100;

    // Re-validate the submitted line items against the charge using the same
    // server-side pricing that created the intent, with the discount taken from
    // the intent's metadata (not the request body, which could be inflated to
    // make mismatched items add up). If the items don't reproduce the amount
    // actually charged, reject rather than storing forged line items.
    const verifiedDiscount =
      Number(paymentIntent.metadata?.discountAmount) || 0;
    let recomputedAmount;
    try {
      recomputedAmount = await computeServerAmount(products, verifiedDiscount);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Order items are invalid or do not match the payment",
      });
    }
    if (recomputedAmount !== verifiedAmount) {
      return res.status(400).json({
        success: false,
        message: "Order items do not match the amount that was paid",
      });
    }

    const createdAt = new Date();
    const deliveryDate = new Date(createdAt);
    deliveryDate.setDate(createdAt.getDate() + 5);

    const newOrder = new OrderModel({
      user: authUserId,
      address: addressId,
      products,
      totalAmount: verifiedAmount,
      couponCode: couponCode || "",
      discountAmount: verifiedDiscount,
      paymentMethod: "STRIPE",
      stripePaymentIntentId: paymentIntentId,
      orderStatus: "PENDING",
      paymentStatus: "COMPLETED",
      paymentVerifiedAt: new Date(),
      deliveryDate,
    });

    await newOrder.save();

    const populatedOrder = await OrderModel.findById(newOrder._id)
      .populate("user", "name email")
      .populate("products.product", "name price images");

    // Card payments are confirmed at creation time, so the receipt email goes
    // out immediately (same as COD), unlike the manual-UPI flow which waits for
    // admin verification.
    try {
      const user = await UserModel.findById(authUserId);
      if (user?.email) {
        const receiptHTML = generateReceiptHTML(populatedOrder);
        sendEmail({
          sendTo: user.email,
          subject: "Order Confirmation",
          html: receiptHTML,
        });
      }
    } catch (emailErr) {
      // A failed receipt email must not fail the order — the payment already
      // went through. Swallow and let the order response succeed.
      console.error("Receipt email failed:", emailErr.message);
    }

    return res.status(201).json({ success: true, order: populatedOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
