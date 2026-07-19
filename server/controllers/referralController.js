import ReferralModel from "../models/referralModel.js";

export const createReferralCode = async (req, res) => {
  try {
    const { referralCode, rewardPercentage } = req.body;
    const referrerId = req.userId;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: "Referral code is required.",
      });
    }

    const codeExists = await ReferralModel.findOne({ referralCode: referralCode.toUpperCase() });
    if (codeExists) {
      return res.status(400).json({
        success: false,
        message: "This referral code is already taken.",
      });
    }

    const newReferral = new ReferralModel({
      referralCode: referralCode.toUpperCase(),
      referrerId,
      rewardPercentage: rewardPercentage || 5,
    });

    await newReferral.save();

    res.status(201).json({
      success: true,
      message: "Referral code created successfully.",
      data: newReferral,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create referral code.",
    });
  }
};

export const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.params;

    const referral = await ReferralModel.findOne({
      referralCode: code.toUpperCase(),
      isActive: true,
    });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive referral code.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Referral code validated successfully.",
      rewardPercentage: referral.rewardPercentage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to validate referral code.",
    });
  }
};
