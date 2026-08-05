import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  revoked: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('refreshToken', refreshTokenSchema);