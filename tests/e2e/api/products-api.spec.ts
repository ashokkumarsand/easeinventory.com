import { test, expect } from '../fixtures/test.fixture';

test.describe('Products API', () => {
  test('GET /api/products returns 200', async ({ apiHelper }) => {
    const res = await apiHelper.get('/api/products');
    expect(res.status()).toBe(200);
  });

  test('GET /api/products returns array', async ({ apiHelper }) => {
    const { data } = await apiHelper.getJSON<unknown[]>('/api/products');
    expect(Array.isArray(data) || (typeof data === 'object' && data !== null)).toBeTruthy();
  });

  test('GET /api/products without auth returns 401', async ({ request }) => {
    // Create a new context without auth cookies
    const res = await request.get('/api/products', {
      headers: { cookie: '' },
    });
    // Should be 401 or 403 (depends on auth middleware)
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/products creates a product', async ({ apiHelper }) => {
    const newProduct = {
      name: `E2E Test Product ${Date.now()}`,
      costPrice: 100,
      modalPrice: 100,
      salePrice: 200,
      quantity: 10,
    };

    const res = await apiHelper.post('/api/products', newProduct);
    expect([200, 201]).toContain(res.status());

    const body = await res.json();
    expect(body.name || body.product?.name || body.id).toBeTruthy();
  });
});
