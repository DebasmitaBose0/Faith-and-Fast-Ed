import redisClient from '../config/redisConfig.js';

export const cacheMiddleware = (keyPrefix, durationSeconds = 3600) => {
  return async (req, res, next) => {
    try {
      // Create a unique key based on prefix and URL/query params
      const key = `${keyPrefix}:${req.originalUrl}`;
      
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Overwrite res.json to cache the response before sending it
      const originalJson = res.json;
      res.json = function (body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(key, durationSeconds, JSON.stringify(body))
            .catch(err => console.error('Redis cache set error:', err));
        }
        originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('Redis cache middleware error:', error);
      next();
    }
  };
};

export const invalidateCache = async (keyPrefix) => {
  try {
    const keys = await redisClient.keys(`${keyPrefix}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Redis cache invalidation error:', error);
  }
};
