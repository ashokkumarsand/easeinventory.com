import { test, expect } from '../fixtures/test.fixture';

test.describe('Analytics API', () => {
  test('GET /api/analytics/kpis returns without 500', async ({ apiHelper }) => {
    const res = await apiHelper.get('/api/analytics/kpis');
    expect(res.status()).not.toBe(500);
  });

  test('GET /api/analytics/abc-xyz returns without 500', async ({ apiHelper }) => {
    const res = await apiHelper.get('/api/analytics/abc-xyz');
    expect(res.status()).not.toBe(500);
  });

  test('GET /api/analytics/demand returns without 500', async ({ apiHelper }) => {
    const res = await apiHelper.get('/api/analytics/demand');
    expect(res.status()).not.toBe(500);
  });

  test('GET /api/analytics/nudges returns without 500', async ({ apiHelper }) => {
    const res = await apiHelper.get('/api/analytics/nudges');
    expect(res.status()).not.toBe(500);
  });

  test('GET /api/analytics/forecast returns without 500', async ({ apiHelper }) => {
    const res = await apiHelper.get('/api/analytics/forecast');
    expect(res.status()).not.toBe(500);
  });

  test('GET /api/analytics/valuation returns without 500', async ({ apiHelper }) => {
    const res = await apiHelper.get('/api/analytics/valuation');
    expect(res.status()).not.toBe(500);
  });

  test('GET /api/analytics/dead-stock returns without 500', async ({ apiHelper }) => {
    const res = await apiHelper.get('/api/analytics/dead-stock');
    expect(res.status()).not.toBe(500);
  });
});
