import AdminAudit from '../models/adminAuditModel.js';

export const getAudits = async (req, res) => {
  try {
    const list = await AdminAudit.find().populate('adminId');
    return res.json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};