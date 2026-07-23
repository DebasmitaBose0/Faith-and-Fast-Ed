import UserModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const generatedRefreshToken = async (userId) => {
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.SECRET_KEY_REFRESH_TOKEN,
    { expiresIn: '7d' }
  );

  await UserModel.findByIdAndUpdate(
    userId,
    { $push: { refreshTokens: refreshToken } },
    { new: true }
  );

  return refreshToken;
};

export default generatedRefreshToken;
