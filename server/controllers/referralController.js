import Referral from '../models/referralModel.js';

export const getReferrals = async (req, res) => {
  try {
    const list = await Referral.find({ referrerId: req.userId });
    return res.json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};