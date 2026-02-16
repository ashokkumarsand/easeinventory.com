import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'easeinventoryadmin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '123456789';

// Ensure .auth directory exists
const authDir = path.join(process.cwd(), 'test-results', '.auth');
fs.mkdirSync(authDir, { recursive: true });

setup('seed test data', async ({ request }) => {
  // Seed is best-effort — don't fail setup if DB schema is out of sync
  try {
    const res = await request.get('/api/test/seed-demo');
    if (res.ok()) {
      const data = await res.json();
      console.log('Seed result:', data.message ?? 'OK');
    } else {
      console.warn('Seed returned', res.status(), '— tests will use admin auth only');
    }
  } catch {
    console.warn('Seed unreachable — tests will use admin auth only');
  }
});

setup('authenticate as admin', async ({ page, context }) => {
  // Step 1: Get CSRF token from NextAuth
  const csrfRes = await context.request.get(`${BASE_URL}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();

  // Step 2: Sign in via NextAuth credentials API
  const signInRes = await context.request.post(`${BASE_URL}/api/auth/callback/credentials`, {
    form: {
      csrfToken,
      email: ADMIN_USER,
      password: ADMIN_PASS,
      workspace: '',
      json: 'true',
    },
  });

  // NextAuth returns a redirect (302) on success, or 200/401 on error
  // The session cookie is now set in the context
  expect(signInRes.status()).toBeLessThan(400);

  // Step 3: Verify session by visiting dashboard
  await page.goto('/dashboard');

  // Should not be redirected to login (give extra time for middleware)
  await page.waitForLoadState('networkidle');

  // Save auth state for reuse
  await context.storageState({ path: path.join(authDir, 'admin.json') });
  await context.storageState({ path: path.join(authDir, 'tenant.json') });

  // Verify we're actually logged in
  const sessionRes = await context.request.get(`${BASE_URL}/api/auth/session`);
  const session = await sessionRes.json();
  expect(session.user).toBeTruthy();
  console.log('Logged in as:', session.user.name ?? session.user.email);
});
