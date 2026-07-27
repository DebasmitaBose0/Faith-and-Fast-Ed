import RefreshToken from '../models/refreshTokenModel.js';

export const blacklistToken = async (token) => {
  return await RefreshToken.findOneAndUpdate({ token }, { revoked: true });
};