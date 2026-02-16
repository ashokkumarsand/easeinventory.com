import { test, expect } from '@playwright/test';

// Register tests use a fresh browser context (no storageState)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Register Page', () => {
  test('page renders', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });

  test('has step 1 business fields', async ({ page }) => {
    await page.goto('/register');

    // Step 1 should show business detail fields
    await expect(page.getByPlaceholder(/john doe/i).or(page.getByLabel(/name/i).first())).toBeVisible({ timeout: 10000 });
  });

  test('has login link', async ({ page }) => {
    await page.goto('/register');
    const loginLink = page.getByRole('link', { name: /log in/i });
    await expect(loginLink).toBeVisible();
  });
});
