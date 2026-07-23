import mongoose from 'mongoose';

const paymentSettingsSchema = new mongoose.Schema(
  {
    upiId: {
      type: String,
      default: '',
    },
    qrCode: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

const PaymentSettingsModel = mongoose.model(
  'PaymentSettings',
  paymentSettingsSchema
);

export default PaymentSettingsModel;
