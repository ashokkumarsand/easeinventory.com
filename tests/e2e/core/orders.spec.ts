import { test, expect } from '../fixtures/test.fixture';

test.describe('Orders Page', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/orders/);
  });

  test('has header content', async ({ page }) => {
    await page.goto('/orders');
    // Should have some heading or content visible
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
  });

  test('has search or filter controls', async ({ page }) => {
    await page.goto('/orders');
    // Use first() to avoid strict mode when multiple controls match
    const controls = page.getByPlaceholder(/search/i)
      .or(page.locator('input[type="search"]'))
      .or(page.getByRole('tab').first());
    await expect(controls.first()).toBeVisible({ timeout: 10000 });
  });

  test('new order form renders', async ({ page }) => {
    await page.goto('/orders/new');
    await expect(page).toHaveURL(/\/orders\/new/);

    // Should have form content
    await expect(page.locator('form, input, select, [role="combobox"]').first()).toBeVisible({ timeout: 10000 });
  });
});
