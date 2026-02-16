import type { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly welcomeHeading: Locator;
  readonly searchBar: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('[data-sidebar="true"]');
    this.welcomeHeading = page.getByRole('heading', { name: /welcome/i });
    this.searchBar = page.getByPlaceholder(/search/i);
    this.userMenu = page.locator('button:has(.rounded-full)').last();
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async navigateTo(menuText: string) {
    await this.sidebar.getByRole('link', { name: new RegExp(menuText, 'i') }).first().click();
  }

  getMenuGroup(groupName: string) {
    return this.sidebar.getByText(groupName, { exact: false });
  }
}
