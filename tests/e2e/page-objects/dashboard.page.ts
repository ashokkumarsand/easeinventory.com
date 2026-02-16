import type { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly welcomeHeading: Locator;
  readonly searchBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('aside, [role="complementary"]').first();
    this.welcomeHeading = page.getByRole('heading', { name: /welcome/i });
    this.searchBar = page.getByRole('button', { name: /search/i });
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async navigateTo(menuText: string) {
    // Menu items have shortcut text appended (e.g., "Inventory G → I")
    await this.sidebar.getByRole('link', { name: new RegExp(menuText, 'i') }).first().click();
  }

  getMenuGroup(groupName: string) {
    return this.sidebar.getByRole('heading', { name: groupName });
  }
}
