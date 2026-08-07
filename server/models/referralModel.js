import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  refereeId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  code: { type: String, required: true, unique: true },
  rewardEarned: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('referral', referralSchema);