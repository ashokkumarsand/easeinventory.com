import type { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly googleButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('easeinventoryadmin or email');
    this.passwordInput = page.getByPlaceholder('••••••••••••');
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.googleButton = page.getByRole('button', { name: /google/i });
    this.registerLink = page.getByRole('link', { name: /register/i });
    this.errorMessage = page.locator('[role="alert"], .text-red-500, .bg-red-500\\/10');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
