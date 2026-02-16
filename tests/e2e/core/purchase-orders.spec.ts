import { test, expect } from '../fixtures/test.fixture';

test.describe('Purchase Orders Page', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/purchase-orders');
    await expect(page).toHaveURL(/\/purchase-orders/);
  });

  test('has create PO button or link', async ({ page }) => {
    await page.goto('/purchase-orders');
    const createBtn = page.getByRole('link', { name: /create|new/i })
      .or(page.getByRole('button', { name: /create|new/i }));
    await expect(createBtn.first()).toBeVisible({ timeout: 10000 });
  });

  test('new PO form renders', async ({ page }) => {
    await page.goto('/purchase-orders/new');
    await expect(page).toHaveURL(/\/purchase-orders\/new/);
    await expect(page.locator('form, input, select, [role="combobox"]').first()).toBeVisible({ timeout: 10000 });
  });
});
