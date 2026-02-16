import type { APIRequestContext } from '@playwright/test';

/**
 * Reusable API helper wrapping Playwright's APIRequestContext.
 * Provides convenience methods for common E2E API operations.
 */
export class ApiHelper {
  constructor(private request: APIRequestContext) {}

  async get(path: string) {
    return this.request.get(path);
  }

  async post(path: string, data?: unknown) {
    return this.request.post(path, { data });
  }

  async put(path: string, data?: unknown) {
    return this.request.put(path, { data });
  }

  async delete(path: string) {
    return this.request.delete(path);
  }

  async healthCheck() {
    const res = await this.get('/api/health');
    return { status: res.status(), body: await res.json() };
  }

  async seedData() {
    const res = await this.get('/api/test/seed-demo');
    return { status: res.status(), body: await res.json() };
  }

  /** Fetch JSON with error handling */
  async getJSON<T = unknown>(path: string): Promise<{ status: number; data: T }> {
    const res = await this.get(path);
    const data = await res.json();
    return { status: res.status(), data };
  }

  async postJSON<T = unknown>(path: string, body: unknown): Promise<{ status: number; data: T }> {
    const res = await this.post(path, body);
    const data = await res.json();
    return { status: res.status(), data };
  }
}
