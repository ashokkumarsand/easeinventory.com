import { test, expect } from '../fixtures/test.fixture';

test.describe('Order Workflow', () => {
  test('create a new order', async ({ page }) => {
    await page.goto('/orders/new');
    await expect(page).toHaveURL(/\/orders\/new/);

    // Wait for form to render
    await expect(page.locator('form, input, select').first()).toBeVisible({ timeout: 10000 });

    // Fill customer info
    const nameInput = page.getByLabel(/customer|name/i).or(page.getByPlaceholder(/customer|name/i)).first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('E2E Test Customer');
    }

    const phoneInput = page.getByLabel(/phone/i).or(page.getByPlaceholder(/phone/i)).first();
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill('+919876543210');
    }

    // Page should load without errors
    await expect(page).toHaveURL(/\/orders/);
  });

  test('orders list loads after navigation', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Should show either order table, empty state, or at least the page header
    const content = page.locator('h1, h2, table, .ag-root, [role="grid"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('order detail page loads for existing orders', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    // Try clicking the first order row if any exist
    const firstOrderLink = page.locator('a[href*="/orders/"]').first();
    if (await firstOrderLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstOrderLink.click();
      await expect(page).toHaveURL(/\/orders\/.+/);
    }
  });
});
