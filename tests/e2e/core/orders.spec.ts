import { test, expect } from '../fixtures/test.fixture';

test.describe('Orders Page', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/orders/);
  });

  test('has create order button or link', async ({ page }) => {
    await page.goto('/orders');
    const createBtn = page.getByRole('link', { name: /create order/i })
      .or(page.getByRole('button', { name: /create order/i }))
      .or(page.getByRole('link', { name: /new order/i }));
    await expect(createBtn).toBeVisible({ timeout: 10000 });
  });

  test('has search input', async ({ page }) => {
    await page.goto('/orders');
    const search = page.getByPlaceholder(/search/i);
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('new order form renders', async ({ page }) => {
    await page.goto('/orders/new');
    await expect(page).toHaveURL(/\/orders\/new/);

    // Should have some form fields
    await expect(page.locator('form, input, select, [role="combobox"]').first()).toBeVisible({ timeout: 10000 });
  });
});
