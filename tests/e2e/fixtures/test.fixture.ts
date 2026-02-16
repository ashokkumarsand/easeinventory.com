import { test as base, expect, type Page, type APIRequestContext } from '@playwright/test';

/** Helper for making authenticated API requests */
class ApiHelper {
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
    return res.json();
  }

  async seedData() {
    const res = await this.get('/api/test/seed-demo');
    return res.json();
  }
}

type TestFixtures = {
  authenticatedPage: Page;
  apiHelper: ApiHelper;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // storageState is already applied via project config
    await use(page);
  },

  apiHelper: async ({ request }, use) => {
    await use(new ApiHelper(request));
  },
});

export { expect };
