import { test, expect } from '../fixtures/test.fixture';

test.describe('Health API', () => {
  test('GET /api/health returns 200', async ({ page }) => {
    const res = await page.request.get('/api/health');
    expect(res.status()).toBe(200);
  });

  test('health check reports database connected', async ({ page }) => {
    const res = await page.request.get('/api/health');
    const body = await res.json();
    expect(body.database).toBe('connected');
  });

  test('health check includes version', async ({ page }) => {
    const res = await page.request.get('/api/health');
    const body = await res.json();
    expect(body.version).toBeDefined();
  });
});
