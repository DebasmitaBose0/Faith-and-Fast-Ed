import SessionModel from "../models/sessionModel.js";

const sendToken = async (user, statusCode, res, req = null) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false, 
    sameSite: "None",
    path: "/"
  };

  // Log session to DB if request context is provided
  if (req) {
    try {
      await SessionModel.create({
        userId: user._id,
        token,
        userAgent: req.headers["user-agent"] || "Unknown",
        ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
      });
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
    verifyEmail: user.verifyEmail, 
  });
};

export default sendToken;
