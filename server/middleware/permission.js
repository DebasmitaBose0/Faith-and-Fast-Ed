import { checkPermission } from '../services/permissionService.js';

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized. Login Again.',
      });
    }

    if (!checkPermission(req.user, permission)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission '${permission}'`,
      });
    }

    return next();
  };
};

