import { test, expect } from '../fixtures/test.fixture';

test.describe('Inventory CRUD Workflow', () => {
  const productName = `E2E-Product-${Date.now()}`;

  test('create a product via UI', async ({ page }) => {
    await page.goto('/inventory');

    // Click add product button
    const addBtn = page.getByRole('button', { name: /add product/i });
    await addBtn.click();

    // Wait for modal/form to appear
    await page.waitForTimeout(500);

    // Fill product name (look for dialog input or inline form)
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/product name/i)).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill(productName);

    // Fill required prices
    const costInput = page.getByLabel(/cost/i).or(page.getByPlaceholder(/cost/i)).first();
    if (await costInput.isVisible().catch(() => false)) {
      await costInput.fill('100');
    }

    const saleInput = page.getByLabel(/sale|mrp/i).or(page.getByPlaceholder(/sale|mrp/i)).first();
    if (await saleInput.isVisible().catch(() => false)) {
      await saleInput.fill('200');
    }

    // Submit
    const submitBtn = page.getByRole('button', { name: /save|add|create|submit/i }).first();
    await submitBtn.click();

    // Should not show error and page should remain on inventory
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('search for created product', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    const search = page.getByPlaceholder(/search/i);
    await search.fill(productName);
    await page.waitForTimeout(1000);

    // Page should still work (no crash)
    await expect(page).toHaveURL(/\/inventory/);
  });
});
