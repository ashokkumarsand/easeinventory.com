import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock ioredis
vi.mock("ioredis", () => {
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  };
  return { default: vi.fn(() => mockRedis) };
});

describe("Redis cache helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.REDIS_URL = "redis://localhost:6379";
  });

  it("should be importable", async () => {
    const mod = await import("@app/core");
    expect(mod.cacheGet).toBeDefined();
    expect(mod.cacheSet).toBeDefined();
    expect(mod.cacheInvalidate).toBeDefined();
  });
});
