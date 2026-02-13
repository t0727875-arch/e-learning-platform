import { createClient } from 'redis';

// Redis client for caching and rate limiting
let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        // Exponential backoff with max 3 seconds
        if (retries > 10) {
          console.error('[Redis] Max reconnection attempts reached');
          return new Error('Max reconnection attempts reached');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  redisClient.on('error', (err) => {
    console.error('[Redis] Client error:', err);
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Client connected');
  });

  redisClient.on('ready', () => {
    console.log('[Redis] Client ready');
  });

  redisClient.on('reconnecting', () => {
    console.log('[Redis] Client reconnecting...');
  });

  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('[Redis] Failed to connect:', error);
    throw error;
  }
}

// Cache helper functions
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`[Redis] Get cache error for key ${key}:`, error);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  try {
    const client = await getRedisClient();
    const serialized = JSON.stringify(value);

    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  } catch (error) {
    console.error(`[Redis] Set cache error for key ${key}:`, error);
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error(`[Redis] Delete cache error for key ${key}:`, error);
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error(`[Redis] Invalidate cache pattern error for ${pattern}:`, error);
  }
}

// Graceful shutdown
export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('[Redis] Connection closed');
  }
}

// Handle process termination
process.on('SIGTERM', closeRedis);
process.on('SIGINT', closeRedis);
