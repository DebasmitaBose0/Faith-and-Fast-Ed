import Vendor from '../models/vendorModel.js';

export const registerVendor = async (req, res) => {
  try {
    const { businessName, taxId } = req.body;
    const vendor = new Vendor({ userId: req.userId, businessName, taxId });
    await vendor.save();
    return res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};