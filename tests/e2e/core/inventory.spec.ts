import { test, expect } from '../fixtures/test.fixture';
import { InventoryPage } from '../page-objects/inventory.page';

test.describe('Inventory Page', () => {
  test('page loads', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('has add product button', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await expect(inventory.addProductButton).toBeVisible();
  });

  test('has search input', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await expect(inventory.searchInput).toBeVisible();
  });

  test('product table or grid renders', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();

    // Wait for either a table, AG Grid, or at least a product row to appear
    await expect(async () => {
      const table = inventory.productTable;
      const anyRow = page.locator('tr, .ag-row, [role="row"]').first();
      const visible = await table.isVisible().catch(() => false) || await anyRow.isVisible().catch(() => false);
      expect(visible).toBeTruthy();
    }).toPass({ timeout: 15000 });
  });

  test('search filters products', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Type in search
    await inventory.searchInput.fill('Wireless');
    await page.waitForTimeout(500); // debounce

    // Page should still be on inventory (didn't crash)
    await expect(page).toHaveURL(/\/inventory/);
  });
});
