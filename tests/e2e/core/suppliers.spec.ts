import { test, expect } from '../fixtures/test.fixture';

test.describe('Suppliers Page', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/suppliers');
    await expect(page).toHaveURL(/\/suppliers/);
  });

  test('has heading or content', async ({ page }) => {
    await page.goto('/suppliers');
    // Page should render without error
    await expect(page.locator('h1, h2, table, .ag-root, [role="grid"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('has add supplier button', async ({ page }) => {
    await page.goto('/suppliers');
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
  });
});
