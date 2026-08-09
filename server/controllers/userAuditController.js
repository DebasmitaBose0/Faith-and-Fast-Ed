import UserAuditModel from "../models/userAuditModel.js";

export const getMyLogs = async (req, res) => {
  try {
    const logs = await UserAuditModel.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user activity logs.",
    });
  }
};
