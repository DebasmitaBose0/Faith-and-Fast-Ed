import mongoose from 'mongoose';

const stockLedgerSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
  delta: { type: Number, required: true },
  reason: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('stockLedger', stockLedgerSchema);