import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import PaymentSettingsModel from "../models/paymentSettingsModel.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import { encrypt, decrypt } from "../utils/encryption.js";

// Public — the checkout page needs the UPI ID and QR to show online-payment instructions.
export const getPaymentSettings = catchAsyncErrors(async (req, res) => {
  try {
    let settings = await PaymentSettingsModel.findOne();

    if (!settings) {
      settings = await PaymentSettingsModel.create({
        upiId: "",
        qrCode: { public_id: "", url: "" },
      });
    }

    const response = settings.toObject();
    if (response.upiId) {
      response.upiId = decrypt(response.upiId);
    }
    res.status(200).json({ success: true, settings: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin — upsert the singleton: set/replace UPI ID and/or upload a new QR image.
export const updatePaymentSettings = catchAsyncErrors(async (req, res) => {
  try {
    const { upiId } = req.body;

    let settings = await PaymentSettingsModel.findOne();
    if (!settings) {
      settings = new PaymentSettingsModel({
        upiId: "",
        qrCode: { public_id: "", url: "" },
      });
    }

    if (typeof upiId === "string") {
      const upiTrimmed = upiId.trim();
      if (upiTrimmed !== "") {
        // Standard UPI validation regex (e.g. username@bankname)
        const upiRegex = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (!upiRegex.test(upiTrimmed)) {
          return res.status(400).json({
            success: false,
            message: "Invalid UPI ID format. Correct format is name@bank",
          });
        }
      }
      settings.upiId = encrypt(upiTrimmed);
    }

    if (req.file) {
      // Remove the previous QR from Cloudinary if one exists (best-effort).
      if (settings.qrCode && settings.qrCode.public_id) {
        try {
          await deleteImage(settings.qrCode.public_id);
        } catch (e) {
          // Non-fatal — proceed with the new upload even if the old delete fails.
        }
      }
      const result = await uploadImage(req.file);
      settings.qrCode = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    await settings.save();

    const response = settings.toObject();
    if (response.upiId) {
      response.upiId = decrypt(response.upiId);
    }

    res.status(200).json({
      success: true,
      message: "Payment settings updated",
      settings: response,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
