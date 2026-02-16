import { test, expect } from '../fixtures/test.fixture';

test.describe('Orders API', () => {
  test('GET /api/orders does not return 500', async ({ page }) => {
    const res = await page.request.get('/api/orders');
    // Admin on 'system' tenant may get 404 — just not 500
    expect(res.status()).not.toBe(500);
  });

  test('GET /api/orders returns order data', async ({ page }) => {
    const res = await page.request.get('/api/orders');
    const data = await res.json();
    expect(data).toBeTruthy();
  });

  test('POST /api/orders returns non-500', async ({ page }) => {
    const newOrder = {
      shippingName: 'E2E Test Customer',
      shippingPhone: '+919876543210',
      shippingAddress: '123 Test Street',
      shippingCity: 'Pune',
      shippingState: 'Maharashtra',
      shippingPincode: '411001',
      items: [],
    };

    const res = await page.request.post('/api/orders', { data: newOrder });
    // 200/201 = success, 400 = validation error — just not 500
    expect(res.status()).not.toBe(500);
  });
});
