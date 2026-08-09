import StockLedger from '../models/stockLedgerModel.js';

export const getLedger = async (req, res) => {
  try {
    const logs = await StockLedger.find({ productId: req.params.id });
    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};