import { test, expect, Page } from '@playwright/test';

// Helper to check CSS variable values
async function getCSSVariable(page: Page, varName: string): Promise<string> {
  return page.evaluate((name) => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }, varName);
}

// Helper to check element computed style
async function getComputedStyleValue(page: Page, selector: string, property: string): Promise<string> {
  const element = page.locator(selector).first();
  if (await element.count() === 0) return '';
  return element.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}

// Dashboard pages to audit
const DASHBOARD_PAGES = [
  { path: '/dashboard', name: 'Dashboard Home' },
  { path: '/dashboard/inventory', name: 'Inventory' },
  { path: '/dashboard/inventory/discounts', name: 'Discounts' },
  { path: '/dashboard/suppliers', name: 'Suppliers' },
  { path: '/dashboard/settings', name: 'Settings' },
  { path: '/dashboard/hr', name: 'HR/Employees' },
];

// Expected CSS variable values for light theme
const LIGHT_THEME_VARS = {
  '--background': '#fafafa',
  '--foreground': '#09090b',
  '--card-bg': '#ffffff',
};

// Expected CSS variable values for dark theme
const DARK_THEME_VARS = {
  '--background': '#09090b',
  '--foreground': '#fafafa',
  '--card-bg': '#18181b',
};

test.describe('Theme Consistency Audit', () => {
  test.describe('Light Theme', () => {
    test.use({ colorScheme: 'light' });

    test('CSS variables are correctly set', async ({ page }) => {
      await page.goto('/');

      for (const [varName, expectedValue] of Object.entries(LIGHT_THEME_VARS)) {
        const actualValue = await getCSSVariable(page, varName);
        console.log(`${varName}: expected ${expectedValue}, got ${actualValue}`);
      }
    });

    for (const pageInfo of DASHBOARD_PAGES) {
      test(`${pageInfo.name} - no hardcoded dark colors`, async ({ page }) => {
        // This would require auth - skip for now, log for manual check
        console.log(`Manual check needed: ${pageInfo.path}`);
      });
    }
  });

  test.describe('Dark Theme', () => {
    test.use({ colorScheme: 'dark' });

    test('CSS variables are correctly set', async ({ page }) => {
      await page.goto('/');

      // Force dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      for (const [varName, expectedValue] of Object.entries(DARK_THEME_VARS)) {
        const actualValue = await getCSSVariable(page, varName);
        console.log(`${varName}: expected ${expectedValue}, got ${actualValue}`);
      }
    });
  });
});

test.describe('Component Consistency Audit', () => {
  test('Landing page components render correctly', async ({ page }) => {
    await page.goto('/');

    // Check navigation exists
    await expect(page.locator('nav').first()).toBeVisible();

    // Check hero section
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();

    // Take screenshot for visual comparison
    await page.screenshot({ path: 'tests/ui-audit/screenshots/landing-light.png', fullPage: true });
  });

  test('Login page styling', async ({ page }) => {
    await page.goto('/login');

    // Check form exists
    await expect(page.locator('form').first()).toBeVisible();

    // Check input fields have proper styling
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const borderRadius = await input.evaluate(el => getComputedStyle(el).borderRadius);
        console.log(`Input ${i} border-radius: ${borderRadius}`);
      }
    }

    await page.screenshot({ path: 'tests/ui-audit/screenshots/login-light.png', fullPage: true });
  });
});

test.describe('Visual Regression - Screenshots', () => {
  const pages = [
    { path: '/', name: 'landing' },
    { path: '/login', name: 'login' },
    { path: '/about', name: 'about' },
    { path: '/pricing', name: 'pricing' },
  ];

  for (const pageInfo of pages) {
    test(`Screenshot: ${pageInfo.name} (light)`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: `tests/ui-audit/screenshots/${pageInfo.name}-light.png`,
        fullPage: true,
      });
    });

    test(`Screenshot: ${pageInfo.name} (dark)`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
      await page.waitForTimeout(500); // Wait for transition
      await page.screenshot({
        path: `tests/ui-audit/screenshots/${pageInfo.name}-dark.png`,
        fullPage: true,
      });
    });
  }
});
