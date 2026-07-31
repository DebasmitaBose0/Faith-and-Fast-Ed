import {
  checkPermission,
  getRolePermissions,
  getRoleMap,
} from './permissionService.js';

export { checkPermission, getRolePermissions, getRoleMap };

export const hasPermission = (user, permission) => {
  return checkPermission(user, permission);
};

export default {
  checkPermission,
  hasPermission,
  getRolePermissions,
  getRoleMap,
};
