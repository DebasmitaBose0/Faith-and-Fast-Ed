import mongoose from 'mongoose';

const adminAuditSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  action: { type: String, required: true },
  targetId: { type: String },
}, { timestamps: true });

export default mongoose.model('adminAudit', adminAuditSchema);