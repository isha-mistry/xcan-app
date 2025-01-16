// utils/redis.ts
import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  // Enable TLS for Upstash (required)
  tls: {},
  // Add retry strategy
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Set reconnect options
  reconnectOnError(err: Error) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  connectTimeout: 10000,
  maxRetriesPerRequest: 5
};

// Create Redis instance with error handling
const redis = new Redis(redisConfig);

// Handle Redis events
// redis.on('connect', () => {
//   console.log('Redis client connected');
// });

// redis.on('error', (error) => {
//   console.error('Redis client error:', error);
// });

// redis.on('ready', () => {
//   console.log('Redis client ready');
// });

// Helper functions for common Redis operations
export const setCache = async (key: string, value: any, expireSeconds?: number) => {
  try {
    const serializedValue = JSON.stringify(value);
    if (expireSeconds) {
      await redis.setex(key, expireSeconds, serializedValue);
    } else {
      await redis.set(key, serializedValue);
    }
  } catch (error) {
    console.error('Redis set error:', error);
    throw error;
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Redis get error:', error);
    throw error;
  }
};

export const deleteCache = async (key: string) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
    throw error;
  }
};

// Test the connection immediately
redis.ping().then(() => {
  console.log('Redis connection test successful');
}).catch((err) => {
  console.error('Redis connection test failed:', err);
});

export default redis;