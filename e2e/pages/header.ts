import type { Page } from '@playwright/test';

export class HeaderPage {
  readonly root;
  readonly nav;
  readonly brand;
  readonly menuToggle;
  readonly themeToggle;

  constructor(private readonly page: Page) {
    this.root = page.locator('app-header');
    this.nav = page.getByRole('navigation', { name: 'Main' });
    this.brand = this.root.getByRole('link', { name: 'Ramkumar Karuppaiah' });
    this.menuToggle = this.root.locator('.menu-toggle');
    this.themeToggle = this.root.getByRole('button', { name: /Switch to (dark|light) theme/ });
  }

  navLink(label: string) {
    return this.nav.getByRole('link', { name: label, exact: true });
  }

  theme() {
    return this.page.locator('html').getAttribute('data-theme');
  }
}
