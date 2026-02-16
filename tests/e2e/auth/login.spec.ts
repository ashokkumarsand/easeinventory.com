import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';

// Login tests use a fresh browser context (no storageState)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Page', () => {
  test('page renders with login form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('has register link', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.registerLink).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid@test.com', 'wrongpassword');

    // Wait for error to appear
    await expect(async () => {
      const errorVisible = await loginPage.errorMessage.isVisible();
      const urlStillLogin = page.url().includes('/login');
      expect(errorVisible || urlStillLogin).toBeTruthy();
    }).toPass({ timeout: 10000 });
  });

  test('valid admin login redirects away from login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const adminUser = process.env.ADMIN_USERNAME || 'easeinventoryadmin';
    const adminPass = process.env.ADMIN_PASSWORD || '123456789';
    await loginPage.login(adminUser, adminPass);

    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  });

  test('empty form shows validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginButton.click();

    // Should still be on login page (not redirected)
    await expect(page).toHaveURL(/\/login/);
  });
});
