import Redis from 'ioredis';

/**
 * Redis Cache Service
 * Provides caching for sessions, API responses, and rate limiting
 */

let redis: Redis | null = null;

/**
 * Get the Redis client instance
 * Creates a new connection if one doesn't exist
 */
export function getRedisClient(): Redis | null {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('[Cache] REDIS_URL not configured - caching disabled');
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.error('[Cache] Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      lazyConnect: true,
    });

    redis.on('connect', () => {
      console.log('[Cache] Redis connected');
    });

    redis.on('error', (err) => {
      console.error('[Cache] Redis error:', err.message);
    });

    redis.on('close', () => {
      console.log('[Cache] Redis connection closed');
    });

    // Connect immediately
    redis.connect().catch((err) => {
      console.error('[Cache] Failed to connect to Redis:', err.message);
      redis = null;
    });

    return redis;
  } catch (error: any) {
    console.error('[Cache] Failed to initialize Redis:', error.message);
    return null;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  const client = getRedisClient();
  return client !== null && client.status === 'ready';
}

// =============================================================================
// CACHE OPERATIONS
// =============================================================================

/**
 * Set a value in the cache
 * @param key Cache key
 * @param value Value to cache (will be JSON stringified)
 * @param ttlSeconds Time to live in seconds (default: 5 minutes)
 */
export async function set(key: string, value: unknown, ttlSeconds: number = 300): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    await client.set(key, serialized, 'EX', ttlSeconds);
    return true;
  } catch (error: any) {
    console.error('[Cache] Error setting key:', error.message);
    return false;
  }
}

/**
 * Get a value from the cache
 * @param key Cache key
 * @returns Parsed value or null if not found
 */
export async function get<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error: any) {
    console.error('[Cache] Error getting key:', error.message);
    return null;
  }
}

/**
 * Delete a key from the cache
 */
export async function del(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error: any) {
    console.error('[Cache] Error deleting key:', error.message);
    return false;
  }
}

/**
 * Delete all keys matching a pattern
 */
export async function delPattern(pattern: string): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    await client.del(...keys);
    return keys.length;
  } catch (error: any) {
    console.error('[Cache] Error deleting pattern:', error.message);
    return 0;
  }
}

/**
 * Check if a key exists
 */
export async function exists(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const result = await client.exists(key);
    return result === 1;
  } catch (error: any) {
    console.error('[Cache] Error checking existence:', error.message);
    return false;
  }
}

/**
 * Get remaining TTL for a key
 */
export async function ttl(key: string): Promise<number> {
  const client = getRedisClient();
  if (!client) return -1;

  try {
    return await client.ttl(key);
  } catch (error: any) {
    console.error('[Cache] Error getting TTL:', error.message);
    return -1;
  }
}

// =============================================================================
// RATE LIMITING HELPERS
// =============================================================================

/**
 * Increment a counter with expiry (for rate limiting)
 * @returns Current count after increment
 */
export async function incrementWithExpiry(key: string, ttlSeconds: number): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    const pipeline = client.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, ttlSeconds);
    const results = await pipeline.exec();

    if (results && results[0] && results[0][1]) {
      return results[0][1] as number;
    }
    return 0;
  } catch (error: any) {
    console.error('[Cache] Error incrementing:', error.message);
    return 0;
  }
}

/**
 * Get the current count for a rate limit key
 */
export async function getCount(key: string): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    const value = await client.get(key);
    return value ? parseInt(value, 10) : 0;
  } catch (error: any) {
    console.error('[Cache] Error getting count:', error.message);
    return 0;
  }
}

// =============================================================================
// SESSION HELPERS
// =============================================================================

/**
 * Store session data
 */
export async function setSession(
  sessionId: string,
  data: Record<string, unknown>,
  ttlSeconds: number = 7 * 24 * 60 * 60 // 7 days
): Promise<boolean> {
  return set(`session:${sessionId}`, data, ttlSeconds);
}

/**
 * Get session data
 */
export async function getSession(sessionId: string): Promise<Record<string, unknown> | null> {
  return get<Record<string, unknown>>(`session:${sessionId}`);
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  return del(`session:${sessionId}`);
}

// =============================================================================
// API RESPONSE CACHING
// =============================================================================

/**
 * Cache an API response
 */
export async function cacheApiResponse(
  endpoint: string,
  params: Record<string, unknown>,
  response: unknown,
  ttlSeconds: number = 60
): Promise<boolean> {
  const key = `api:${endpoint}:${JSON.stringify(params)}`;
  return set(key, response, ttlSeconds);
}

/**
 * Get a cached API response
 */
export async function getCachedApiResponse<T>(
  endpoint: string,
  params: Record<string, unknown>
): Promise<T | null> {
  const key = `api:${endpoint}:${JSON.stringify(params)}`;
  return get<T>(key);
}

/**
 * Invalidate API cache for an endpoint
 */
export async function invalidateApiCache(endpoint: string): Promise<number> {
  return delPattern(`api:${endpoint}:*`);
}

// =============================================================================
// REAL-TIME HELPERS
// =============================================================================

/**
 * Track online users
 */
export async function setUserOnline(userId: string, ttlSeconds: number = 300): Promise<boolean> {
  return set(`online:${userId}`, { lastSeen: Date.now() }, ttlSeconds);
}

/**
 * Check if user is online
 */
export async function isUserOnline(userId: string): Promise<boolean> {
  return exists(`online:${userId}`);
}

/**
 * Get all online users (basic implementation)
 */
export async function getOnlineUsers(): Promise<string[]> {
  const client = getRedisClient();
  if (!client) return [];

  try {
    const keys = await client.keys('online:*');
    return keys.map(k => k.replace('online:', ''));
  } catch (error: any) {
    console.error('[Cache] Error getting online users:', error.message);
    return [];
  }
}

// =============================================================================
// LIFECYCLE
// =============================================================================

/**
 * Close the Redis connection
 */
export async function close(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('[Cache] Redis connection closed');
  }
}

export default {
  getRedisClient,
  isRedisAvailable,
  set,
  get,
  del,
  delPattern,
  exists,
  ttl,
  incrementWithExpiry,
  getCount,
  setSession,
  getSession,
  deleteSession,
  cacheApiResponse,
  getCachedApiResponse,
  invalidateApiCache,
  setUserOnline,
  isUserOnline,
  getOnlineUsers,
  close,
};
