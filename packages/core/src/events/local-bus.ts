type EventHandler = (event: { source: string; detailType: string; detail: Record<string, unknown> }) => void | Promise<void>;

class LocalEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(detailType: string, handler: EventHandler): void {
    const existing = this.handlers.get(detailType) || [];
    existing.push(handler);
    this.handlers.set(detailType, existing);
  }

  subscribeAll(handler: EventHandler): void {
    this.subscribe("*", handler);
  }

  async publish(source: string, detailType: string, detail: Record<string, unknown>): Promise<void> {
    const event = { source, detailType, detail: { ...detail, timestamp: new Date().toISOString() } };

    console.log(`[EventBus] ${source} → ${detailType}`, JSON.stringify(detail).slice(0, 200));

    // Specific handlers
    const specific = this.handlers.get(detailType) || [];
    for (const handler of specific) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventBus] Handler error for ${detailType}:`, err);
      }
    }

    // Wildcard handlers
    const wildcards = this.handlers.get("*") || [];
    for (const handler of wildcards) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventBus] Wildcard handler error:`, err);
      }
    }
  }
}

// Singleton
export const localBus = new LocalEventBus();
