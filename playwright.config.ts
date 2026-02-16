import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  outputDir: 'test-results/artifacts',
  reporter: [
    ['html', { outputFolder: 'test-results/report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // ── E2E Auth Setup ──
    {
      name: 'e2e-setup',
      testDir: './tests/e2e',
      testMatch: /auth\.setup\.ts/,
    },
    // ── E2E Tests ──
    {
      name: 'e2e-chromium',
      testDir: './tests/e2e',
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'test-results/.auth/tenant.json',
      },
      dependencies: ['e2e-setup'],
    },
    // ── Existing UI Audit Projects (unchanged) ──
    {
      name: 'ui-audit-light',
      testDir: './tests/ui-audit',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'light',
      },
    },
    {
      name: 'ui-audit-dark',
      testDir: './tests/ui-audit',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
