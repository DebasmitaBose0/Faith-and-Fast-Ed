import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import PaymentSettingsModel from "../models/paymentSettings.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import { encrypt, decrypt } from "../utils/cryptoHelper.js";

// Public — the checkout page needs the UPI ID and QR to show online-payment instructions.
export const getPaymentSettings = catchAsyncErrors(async (req, res) => {
  try {
    let settings = await PaymentSettingsModel.findOne();

    if (!settings) {
      settings = await PaymentSettingsModel.create({
        upiId: "",
        qrCode: { public_id: "", url: "" },
      });
    } else if (settings.upiId) {
      // Decrypt UPI ID before sending it to the client for display
      try {
        settings.upiId = decrypt(settings.upiId);
      } catch (e) {
        // Fallback to raw if not encrypted
      }
    }

    res.status(200).json({ success: true, settings });
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
      settings.upiId = encrypt(upiId.trim());
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

    res.status(200).json({
      success: true,
      message: "Payment settings updated",
      settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
