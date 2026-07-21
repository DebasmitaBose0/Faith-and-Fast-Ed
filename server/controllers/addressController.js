import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import AddressModel from '../models/addressModel.js';
import UserModel from '../models/userModel.js';
import mongoose from 'mongoose';

export const addAddress = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user._id;
    const { address_line, city, state, pincode, country, mobile } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: true,
        success: false,
      });
    }

    const existingAddress = await AddressModel.findOne({
      userId,
      address_line,
      pincode,
    });
    if (existingAddress) {
      return res.status(400).json({
        message: 'This address already exists',
        error: true,
        success: false,
      });
    }

    const newAddress = new AddressModel({
      address_line,
      city,
      state,
      country,
      pincode,
      mobile,
      userId,
    });

    const savedAddress = await newAddress.save();

    await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: { addressDetails: savedAddress._id },
      },
      { new: true }
    );

    return res.status(201).json({
      message: 'Address created successfully',
      error: false,
      success: true,
      data: savedAddress,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
});

export const getAddress = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
        error: true,
        success: false,
      });
    }

    const addresses = await AddressModel.find({ userId }).sort({
      createdAt: -1,
    });

    if (!addresses.length) {
      return res.status(404).json({
        message: 'No address found for this user',
        error: false,
        success: true,
        data: [],
      });
    }

    return res.status(200).json({
      message: 'List of addresses retrieved successfully',
      error: false,
      success: true,
      data: addresses,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

export const updateAddress = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user._id;
    const { _id, address_line, city, state, country, pincode, mobile } =
      req.body;

    if (!_id) {
      return res.status(400).json({
        message: 'Address ID is required',
        error: true,
        success: false,
      });
    }

    const updateAddress = await AddressModel.findOneAndUpdate(
      { _id, userId },
      { address_line, city, state, country, mobile, pincode },
      { new: true, runValidators: true }
    );

    if (!updateAddress) {
      return res.status(404).json({
        message: 'Address not found or unauthorized',
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: 'Address updated successfully',
      error: false,
      success: true,
      data: updateAddress,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
});

export const deleteAddress = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    console.log('User ID:', userId);
    console.log('Address ID to Delete:', id);

    if (!id) {
      return res.status(400).json({
        message: 'Address ID is required',
        error: true,
        success: false,
      });
    }
    const address = await AddressModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    console.log('Address Found in DB:', address);
    if (!address) {
      return res.status(404).json({
        message: 'Address not found or unauthorized',
        error: true,
        success: false,
      });
    }

    const deleteAddress = await AddressModel.deleteOne({
      _id: id,
      userId,
    });

    if (deleteAddress.deletedCount === 0) {
      return res.status(404).json({
        message: 'Address not found or unauthorized',
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: 'Address removed successfully',
      error: false,
      success: true,
      data: { id },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
});
