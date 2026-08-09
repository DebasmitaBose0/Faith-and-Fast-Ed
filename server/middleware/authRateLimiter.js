import { createLimiter, rateLimiters } from './rateLimiter.js';

const authRateLimiter = rateLimiters.auth || createLimiter('auth');

export default authRateLimiter;
