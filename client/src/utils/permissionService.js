import defaultRolesConfig from '../config/roles.js';

const DEFAULT_ROLE_MAP = {
  ADMIN: ['*'],
  USER: [],
};

/**
 * Returns the effective role-to-permissions map for the client.
 * Merges loaded roles config and optional VITE_ROLE_PERMISSIONS_MAP env.
 * @returns {Object} Role permissions map.
 */
export const getRoleMap = () => {
  let roleMap = { ...DEFAULT_ROLE_MAP, ...(defaultRolesConfig || {}) };

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ROLE_PERMISSIONS_MAP) {
      const parsedEnv = JSON.parse(import.meta.env.VITE_ROLE_PERMISSIONS_MAP);
      roleMap = { ...roleMap, ...parsedEnv };
    }
  } catch (error) {
    console.warn('Failed to parse VITE_ROLE_PERMISSIONS_MAP:', error);
  }

  return roleMap;
};

/**
 * Gets explicit role permissions array from role map.
 * @param {string} role
 * @param {Object} [customRoleMap]
 * @returns {string[]}
 */
export const getRolePermissions = (role, customRoleMap = null) => {
  if (!role) return [];
  const map = customRoleMap || getRoleMap();
  return map[role] || [];
};

/**
 * Generic check permission utility.
 * Evaluates whether a user has the required permission via role map OR explicit permissions.
 *
 * @param {Object} user - User object containing `role` and/or `permissions`.
 * @param {string} requiredPermission - Permission string (e.g. 'discounts:write').
 * @param {Object} [customRoleMap] - Optional custom role map override.
 * @returns {boolean} True if authorized, false otherwise.
 */
export const checkPermission = (user, requiredPermission, customRoleMap = null) => {
  if (!user || !requiredPermission) return false;

  const roleMap = customRoleMap || getRoleMap();

  // 1. Role-based permissions check
  const rolePermissions = user.role ? roleMap[user.role] || [] : [];
  if (rolePermissions.includes('*') || rolePermissions.includes(requiredPermission)) {
    return true;
  }

  // 2. Explicit user permissions check
  const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
  if (userPermissions.includes('*') || userPermissions.includes(requiredPermission)) {
    return true;
  }

  return false;
};

export const hasPermission = checkPermission;

export default {
  getRoleMap,
  getRolePermissions,
  checkPermission,
  hasPermission,
};
