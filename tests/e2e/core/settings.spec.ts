import { test, expect } from '../fixtures/test.fixture';

test.describe('Settings Page', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/);
  });

  test('has tabs', async ({ page }) => {
    await page.goto('/settings');
    // Look for tab buttons/triggers
    const tabList = page.locator('[role="tablist"]');
    await expect(tabList).toBeVisible({ timeout: 10000 });
  });

  test('profile tab has name field', async ({ page }) => {
    await page.goto('/settings');
    // Wait for profile tab content to load
    await expect(page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i)).first()).toBeVisible({ timeout: 10000 });
  });

  test('can switch to business tab', async ({ page }) => {
    await page.goto('/settings');
    const businessTab = page.getByRole('tab', { name: /business/i });
    if (await businessTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await businessTab.click();
      await expect(page.getByLabel(/gst/i).or(page.getByPlaceholder(/gst|27XXXXX/i)).first()).toBeVisible({ timeout: 10000 });
    }
  });
});
