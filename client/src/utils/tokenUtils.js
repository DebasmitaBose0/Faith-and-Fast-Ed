import { jwtDecode } from 'jwt-decode';

/**
 * Decode the payload segment of a JWT using jwt-decode library.
 * Returns the parsed payload object, or null if token is missing or malformed.
 *
 * @param {string} token - JWT token string.
 * @returns {Object|null} Parsed payload object or null.
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Checks whether a token exists, decodes cleanly, and is unexpired (with optional clock-skew allowance).
 *
 * @param {string} token - JWT token string.
 * @param {number} [clockSkewSeconds=0] - Clock skew allowance in seconds.
 * @returns {boolean} True if valid and active, false otherwise.
 */
export const isTokenValid = (token, clockSkewSeconds = 0) => {
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== 'number') return false;

  const nowMs = Date.now() - clockSkewSeconds * 1000;
  return payload.exp * 1000 > nowMs;
};

/**
 * Checks whether a valid token will expire within the given threshold (default: 5 minutes).
 *
 * @param {string} token - JWT token string.
 * @param {number} [thresholdMs=300000] - Threshold in milliseconds (default 5 minutes).
 * @param {number} [clockSkewMs=0] - Clock skew in milliseconds.
 * @returns {boolean} True if valid but expiring soon, false otherwise.
 */
export const isTokenExpiringSoon = (
  token,
  thresholdMs = 5 * 60 * 1000,
  clockSkewMs = 0
) => {
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== 'number') return false;

  const expiresAtMs = payload.exp * 1000;
  const nowMs = Date.now() - clockSkewMs;

  if (expiresAtMs <= nowMs) {
    // Already expired
    return false;
  }

  return expiresAtMs - nowMs <= thresholdMs;
};

/**
 * Returns detailed diagnostic information and status about a JWT token.
 *
 * @param {string} token - JWT token string.
 * @param {number} [clockSkewSeconds=0] - Clock skew allowance in seconds.
 * @returns {Object} Diagnostic details object.
 */
export const getTokenDetails = (token, clockSkewSeconds = 0) => {
  if (!token || typeof token !== 'string') {
    return {
      isValid: false,
      isExpired: false,
      isExpiringSoon: false,
      payload: null,
      expiresAt: null,
      error: 'TOKEN_MISSING',
    };
  }

  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== 'number') {
    return {
      isValid: false,
      isExpired: false,
      isExpiringSoon: false,
      payload: null,
      expiresAt: null,
      error: 'TOKEN_MALFORMED',
    };
  }

  const expiresAt = new Date(payload.exp * 1000);
  const nowMs = Date.now() - clockSkewSeconds * 1000;
  const isExpired = payload.exp * 1000 <= nowMs;
  const expiringSoon = isTokenExpiringSoon(token);

  if (isExpired) {
    return {
      isValid: false,
      isExpired: true,
      isExpiringSoon: false,
      payload,
      expiresAt,
      error: 'TOKEN_EXPIRED',
    };
  }

  return {
    isValid: true,
    isExpired: false,
    isExpiringSoon: expiringSoon,
    payload,
    expiresAt,
    error: null,
  };
};

/**
 * Invokes the server refresh token endpoint, updates local storage, and returns the new token.
 *
 * @param {Object} axiosInstance - Axios instance to make API request.
 * @param {string} [endpoint='/api/user/refresh-token'] - Refresh token API URL.
 * @returns {Promise<string>} The new JWT access token.
 */
export const refreshToken = async (
  axiosInstance,
  endpoint = '/api/user/refresh-token'
) => {
  if (!axiosInstance || typeof axiosInstance.post !== 'function') {
    throw new Error('Axios instance required for refreshToken');
  }

  try {
    const response = await axiosInstance.post(endpoint, {}, { withCredentials: true });
    const newToken =
      response.data?.token ||
      response.data?.accessToken ||
      response.data?.data?.token;

    if (newToken) {
      localStorage.setItem('token', newToken);
      return newToken;
    }

    throw new Error('No new token returned from refresh endpoint');
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

export default {
  decodeToken,
  isTokenValid,
  isTokenExpiringSoon,
  getTokenDetails,
  refreshToken,
};
