import SessionModel from "../models/sessionModel.js";

export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await SessionModel.find({
      userId: req.userId,
      isRevoked: false,
    }).sort({ lastActiveAt: -1 });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch active sessions.",
    });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await SessionModel.findOne({
      _id: sessionId,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    session.isRevoked = true;
    await session.save();

    res.status(200).json({
      success: true,
      message: "Session revoked successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to revoke session.",
    });
  }
};

export const revokeAllOtherSessions = async (req, res) => {
  try {
    // Revoke all sessions for this user EXCEPT the one matching the current request's token
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    await SessionModel.updateMany(
      {
        userId: req.userId,
        token: { $ne: token },
      },
      {
        $set: { isRevoked: true },
      }
    );

    res.status(200).json({
      success: true,
      message: "All other sessions revoked successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to revoke other sessions.",
    });
  }
};
