import type { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly addProductButton: Locator;
  readonly searchInput: Locator;
  readonly productTable: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addProductButton = page.getByRole('button', { name: /add product/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.productTable = page.locator('table, .ag-root, [role="grid"]');
    this.heading = page.getByRole('heading', { name: /inventory/i });
  }

  async goto() {
    await this.page.goto('/inventory');
  }
}
