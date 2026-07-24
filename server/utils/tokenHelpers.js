import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

export const generatedAccessToken = async (user) => {
  return jwt.sign({ id: user }, process.env.SECRET_KEY_ACCESS_TOKEN || "access_secret", {
    expiresIn: "5hr",
  });
};

export const generatedRefreshToken = async (userId) => {
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.SECRET_KEY_REFRESH_TOKEN || "refresh_secret",
    { expiresIn: "7d" }
  );

  await UserModel.findByIdAndUpdate(
    userId,
    { $push: { refreshTokens: refreshToken } },
    { new: true }
  );

  return refreshToken;
};

export default { generatedAccessToken, generatedRefreshToken };
