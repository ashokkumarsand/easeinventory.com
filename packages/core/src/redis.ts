import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Enable TLS for AWS ElastiCache (rediss:// prefix)
      tls: url.startsWith("rediss://") ? {} : undefined,
      // Graceful connection handling for local dev
      lazyConnect: true,
    });

    redis.on("error", (err) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Redis] Connection error (is Docker running?):", err.message);
      }
    });
  }
  return redis;
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedis().get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null; // Graceful fallback if Redis is down
  }
}

export async function cacheSet(key: string, data: unknown, ttlSeconds = 300): Promise<void> {
  try {
    await getRedis().set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch {
    // Silently skip if Redis is down
  }
}

export async function cacheInvalidate(pattern: string): Promise<void> {
  try {
    const keys = await getRedis().keys(pattern);
    if (keys.length > 0) {
      await getRedis().del(...keys);
    }
  } catch {
    // Silently skip if Redis is down
  }
}
