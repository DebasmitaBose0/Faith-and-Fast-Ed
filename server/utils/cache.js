import { createClient } from "redis";

let redisClient = null;
let isRedisConnected = false;
const inMemoryCache = new Map();

// Initialize Redis connection
export const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  try {
    redisClient = createClient({ url: redisUrl });
    redisClient.on("error", (err) => {
      if (isRedisConnected) {
        console.warn(`[CACHE-WARN] Redis disconnected: ${err.message}. Falling back to in-memory.`);
      }
      isRedisConnected = false;
    });
    redisClient.on("connect", () => {
      console.log("[CACHE] Connected to Redis successfully.");
      isRedisConnected = true;
    });
    await redisClient.connect();
  } catch (error) {
    console.warn(`[CACHE-WARN] Redis connection failed: ${error.message}. Using in-memory fallback.`);
    redisClient = null;
    isRedisConnected = false;
  }
};

// Get item from cache
export const getCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error(`[CACHE-ERROR] Redis get failed for key ${key}:`, err.message);
    }
  }
  
  // InMemory fallback
  const cached = inMemoryCache.get(key);
  if (cached) {
    if (Date.now() > cached.expiry) {
      inMemoryCache.delete(key);
      return null;
    }
    return cached.value;
  }
  return null;
};

// Set item in cache with TTL (in seconds)
export const setCache = async (key, value, ttlSeconds = 300) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
      });
      return;
    } catch (err) {
      console.error(`[CACHE-ERROR] Redis set failed for key ${key}:`, err.message);
    }
  }

  // InMemory fallback
  inMemoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

// Delete key or pattern from cache
export const invalidateCache = async (pattern) => {
  console.log(`[CACHE] Invalidating cache pattern: "${pattern}"`);
  
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`[CACHE] Deleted keys from Redis: ${keys.join(", ")}`);
      }
    } catch (err) {
      console.error(`[CACHE-ERROR] Redis keys/del failed for pattern ${pattern}:`, err.message);
    }
  }

  // InMemory fallback: scan keys and delete matching patterns
  const regexPattern = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  let deletedCount = 0;
  for (const key of inMemoryCache.keys()) {
    if (regexPattern.test(key)) {
      inMemoryCache.delete(key);
      deletedCount++;
    }
  }
  if (deletedCount > 0) {
    console.log(`[CACHE-IN-MEMORY] Invalidated ${deletedCount} key(s) matching "${pattern}"`);
  }
};

// Express cache middleware
export const cacheMiddleware = (prefix, ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Generate cache key based on query signature and path
    const queryStr = Object.keys(req.query)
      .sort()
      .map(k => `${k}=${req.query[k]}`)
      .join("&");
      
    const cleanPath = req.path.replace(/^\/+|\/+$/g, "");
    const cacheKey = `${prefix}:${cleanPath}${queryStr ? "?" + queryStr : ""}`;

    try {
      const cachedResponse = await getCache(cacheKey);
      if (cachedResponse) {
        console.log(`[CACHE-HIT] Key: ${cacheKey}`);
        res.setHeader("X-Cache", "HIT");
        return res.json(cachedResponse);
      }
      
      console.log(`[CACHE-MISS] Key: ${cacheKey}`);
      res.setHeader("X-Cache", "MISS");

      // Intercept res.json to cache successful responses
      const originalJson = res.json;
      res.json = function (body) {
        if (body && body.success === true) {
          setCache(cacheKey, body, ttlSeconds).catch(err => 
            console.error(`[CACHE-ERROR] Async caching failed for key ${cacheKey}:`, err.message)
          );
        }
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error(`[CACHE-MIDDLEWARE-ERROR] Key ${cacheKey}:`, error.message);
      next();
    }
  };
};
