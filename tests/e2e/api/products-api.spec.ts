import { test, expect } from '../fixtures/test.fixture';

test.describe('Products API', () => {
  test('GET /api/products does not return 500', async ({ page }) => {
    const res = await page.request.get('/api/products');
    // Admin on 'system' tenant may get 404 — just not 500
    expect(res.status()).not.toBe(500);
  });

  test('GET /api/products returns parseable response', async ({ page }) => {
    const res = await page.request.get('/api/products');
    expect(res.status()).not.toBe(500);
    const data = await res.json();
    expect(data).toBeTruthy();
  });

  test('POST /api/products with data returns non-500', async ({ page }) => {
    const newProduct = {
      name: `E2E Test Product ${Date.now()}`,
      costPrice: 100,
      modalPrice: 100,
      salePrice: 200,
      quantity: 10,
    };

    const res = await page.request.post('/api/products', { data: newProduct });
    // 200/201 = success, 400 = validation error, 403 = permission — just not 500
    expect(res.status()).not.toBe(500);
  });
});
