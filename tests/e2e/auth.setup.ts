import { test as setup, expect } from '@playwright/test';

const ADMIN_USER = process.env.ADMIN_USERNAME || 'easeinventoryadmin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '123456789';

const TENANT_USER = 'test@e2e.local';
const TENANT_PASS = 'Test123456!';
const TENANT_WORKSPACE = 'e2e-test';

setup('seed test data', async ({ request }) => {
  const res = await request.get('/api/test/seed-demo');
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data.tenant.slug).toBe('e2e-test');
});

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('easeinventoryadmin or email').fill(ADMIN_USER);
  await page.getByPlaceholder('••••••••••••').fill(ADMIN_PASS);
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for redirect after login
  await page.waitForURL('**/*', { timeout: 15000 });
  await expect(page).not.toHaveURL(/\/login/);

  await page.context().storageState({ path: 'test-results/.auth/admin.json' });
});

setup('authenticate as tenant user', async ({ page }) => {
  await page.goto('/login');

  // Fill workspace if field is visible
  const workspaceField = page.getByPlaceholder('your-company');
  if (await workspaceField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await workspaceField.fill(TENANT_WORKSPACE);
  }

  await page.getByPlaceholder('easeinventoryadmin or email').fill(TENANT_USER);
  await page.getByPlaceholder('••••••••••••').fill(TENANT_PASS);
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for redirect after login
  await page.waitForURL('**/*', { timeout: 15000 });
  await expect(page).not.toHaveURL(/\/login/);

  await page.context().storageState({ path: 'test-results/.auth/tenant.json' });
});
