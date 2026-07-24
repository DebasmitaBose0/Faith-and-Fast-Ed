/**
 * Lightweight JWT helpers for client-side session validation.
 *
 * The auth token issued by the server is a standard JWT whose payload
 * contains an `exp` claim (expiry, in Unix seconds). These helpers decode
 * that payload without any external dependency so the app can tell whether
 * a stored token is still valid before treating the user as authenticated.
 */

/**
 * Decode the payload segment of a JWT.
 * Returns the parsed payload object, or null if the token is missing or
 * malformed (not a decodable three-part JWT).
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    // JWT uses base64url; convert to standard base64 before decoding.
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Returns true only when the token exists, decodes cleanly, and its `exp`
 * claim is in the future. A missing, malformed, or expired token returns
 * false — so callers can treat "valid token" and "authenticated" as the
 * same thing.
 */
export const isTokenValid = (token) => {
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== 'number') return false;

  // exp is in seconds; Date.now() is in milliseconds.
  return payload.exp * 1000 > Date.now();
};
