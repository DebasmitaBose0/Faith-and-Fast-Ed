import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { requestContextStore } from '../utils/logger.js';

const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (req.user) {
      const store = requestContextStore.getStore();
      if (store) {
        store.userId = req.user.id || req.user._id;
      }
    }

    next();
  } catch (error) {
    console.warn('JWT verification failed in optionalAuth:', error.name);
    // Continue even if token fails, but don't set req.user
    next();
  }
};

export default optionalAuth;
