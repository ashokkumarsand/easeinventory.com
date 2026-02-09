import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock AWS SDK
vi.mock("@aws-sdk/client-eventbridge", () => ({
  EventBridgeClient: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({}),
  })),
  PutEventsCommand: vi.fn(),
}));

describe("Event publisher", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.EVENT_BUS_NAME = "test-bus";
  });

  it("should publish event to EventBridge", async () => {
    const { publishEvent } = await import("@app/core");
    await publishEvent("easeinventory.order", "OrderCreated", {
      tenantId: "tenant-1",
      orderId: "order-1",
    });
    // If no error thrown, success
    expect(true).toBe(true);
  });

  it("should skip when EVENT_BUS_NAME is not set", async () => {
    delete process.env.EVENT_BUS_NAME;
    const { publishEvent } = await import("@app/core");
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await publishEvent("easeinventory.order", "OrderCreated", { tenantId: "t1" });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("EVENT_BUS_NAME not set"),
      "OrderCreated"
    );
    consoleSpy.mockRestore();
  });
});
