import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    address_line: {
      type: String,
      required: [true, 'Please provide an address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide a state'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please provide a pincode'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Please provide a country'],
      trim: true,
      default: 'India',
    },
    mobile: {
      type: Number,
      required: [true, 'Please provide a mobile number'],
      match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number'],
    },
    status: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.index({ userId: 1 });

const AddressModel = mongoose.model('address', addressSchema);

export default AddressModel;
