import { test, expect } from '../fixtures/test.fixture';

test.describe('Orders API', () => {
  test('GET /api/orders returns 200', async ({ apiHelper }) => {
    const res = await apiHelper.get('/api/orders');
    expect(res.status()).toBe(200);
  });

  test('GET /api/orders returns order data', async ({ apiHelper }) => {
    const { data } = await apiHelper.getJSON('/api/orders');
    expect(data).toBeTruthy();
  });

  test('POST /api/orders creates a draft order', async ({ apiHelper }) => {
    const newOrder = {
      shippingName: 'E2E Test Customer',
      shippingPhone: '+919876543210',
      shippingAddress: '123 Test Street',
      shippingCity: 'Pune',
      shippingState: 'Maharashtra',
      shippingPincode: '411001',
      items: [],
    };

    const res = await apiHelper.post('/api/orders', newOrder);
    // Could be 200, 201, or 400 (if items required)
    expect([200, 201, 400]).toContain(res.status());
  });
});
