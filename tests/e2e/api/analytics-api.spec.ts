import { test, expect } from '../fixtures/test.fixture';

test.describe('Analytics API', () => {
  // These tests verify endpoints don't return 500 (server error).
  // Admin on 'system' tenant may get 404/401 — that's fine; just not 500.

  const endpoints = [
    '/api/analytics/kpis',
    '/api/analytics/abc-xyz',
    '/api/analytics/demand',
    '/api/analytics/nudges',
    '/api/analytics/forecast',
    '/api/analytics/valuation',
    '/api/analytics/dead-stock',
  ];

  for (const endpoint of endpoints) {
    test(`GET ${endpoint} does not return 500`, async ({ page }) => {
      const res = await page.request.get(endpoint);
      expect(res.status()).not.toBe(500);
    });
  }
});
