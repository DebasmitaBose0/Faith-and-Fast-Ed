import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DEFAULT_ROLE_MAP = {
  ADMIN: ['*'],
  USER: [],
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads the role-to-permissions mapping from config file or environment variables.
 * @returns {Object} Role permissions map.
 */
export const getRoleMap = () => {
  let roleMap = { ...DEFAULT_ROLE_MAP };

  // 1. Try reading from server/config/roles.json or config/roles.json
  try {
    const configPath = path.resolve(__dirname, '../config/roles.json');
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, 'utf8');
      roleMap = { ...roleMap, ...JSON.parse(fileContent) };
    }
  } catch (error) {
    console.warn('Failed to load roles.json in permission service:', error.message);
  }

  // 2. Override with env variable if provided (as JSON string)
  if (process.env.ROLE_PERMISSIONS_MAP) {
    try {
      const envMap = JSON.parse(process.env.ROLE_PERMISSIONS_MAP);
      roleMap = { ...roleMap, ...envMap };
    } catch (error) {
      console.warn('Failed to parse ROLE_PERMISSIONS_MAP env variable:', error.message);
    }
  }

  return roleMap;
};

/**
 * Get permissions list for a given role.
 * @param {string} role - The role name (e.g. 'ADMIN', 'USER').
 * @param {Object} [customRoleMap] - Optional map override.
 * @returns {string[]} List of permissions.
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
 * @param {Object} [customRoleMap] - Optional role map override.
 * @returns {boolean} True if authorized, false otherwise.
 */
export const checkPermission = (user, requiredPermission, customRoleMap = null) => {
  if (!user || !requiredPermission) return false;

  const roleMap = customRoleMap || getRoleMap();

  // 1. Check role-based permissions
  const rolePermissions = user.role ? roleMap[user.role] || [] : [];
  if (rolePermissions.includes('*') || rolePermissions.includes(requiredPermission)) {
    return true;
  }

  // 2. Check user explicit permissions
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
