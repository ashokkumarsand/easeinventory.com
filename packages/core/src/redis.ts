import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error("REDIS_URL environment variable is not set");
    }
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Enable TLS for AWS ElastiCache
      tls: url.startsWith("rediss://") ? {} : undefined,
    });
  }
  return redis;
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await getRedis().get(key);
  return data ? JSON.parse(data) : null;
}

export async function cacheSet(key: string, data: unknown, ttlSeconds = 300): Promise<void> {
  await getRedis().set(key, JSON.stringify(data), "EX", ttlSeconds);
}

export async function cacheInvalidate(pattern: string): Promise<void> {
  const keys = await getRedis().keys(pattern);
  if (keys.length > 0) {
    await getRedis().del(...keys);
  }
}
