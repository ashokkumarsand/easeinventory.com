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

  test('shows error or stays on login with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid@test.com', 'wrongpassword');

    // Should stay on login page (error shown or page didn't navigate)
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/login');
  });

  test('valid admin login triggers auth', async ({ page, context }) => {
    // Use the API approach since the browser login redirects to admin subdomain
    const csrfRes = await context.request.get('http://localhost:3000/api/auth/csrf');
    const { csrfToken } = await csrfRes.json();

    const signInRes = await context.request.post('http://localhost:3000/api/auth/callback/credentials', {
      form: {
        csrfToken,
        email: process.env.ADMIN_USERNAME || 'easeinventoryadmin',
        password: process.env.ADMIN_PASSWORD || '123456789',
        workspace: '',
        json: 'true',
      },
    });

    expect(signInRes.status()).toBeLessThan(400);

    // Verify session exists
    const sessionRes = await context.request.get('http://localhost:3000/api/auth/session');
    const session = await sessionRes.json();
    expect(session.user).toBeTruthy();
  });

  test('empty form does not navigate away', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginButton.click();

    // Should still be on login page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
  });
});
