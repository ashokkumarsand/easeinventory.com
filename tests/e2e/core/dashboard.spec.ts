import { test, expect } from '../fixtures/test.fixture';
import { DashboardPage } from '../page-objects/dashboard.page';

test.describe('Dashboard', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('sidebar is visible', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.sidebar).toBeVisible();
  });

  test('has Overview menu group', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.getMenuGroup('Overview')).toBeVisible();
  });

  test('has Operations menu group', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.getMenuGroup('Operations')).toBeVisible();
  });

  test('can navigate to inventory', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.navigateTo('Inventory');
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('can navigate to orders', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.navigateTo('Orders');
    await expect(page).toHaveURL(/\/orders/);
  });
});
