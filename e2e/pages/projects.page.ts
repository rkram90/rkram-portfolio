import type { Page } from '@playwright/test';

export class ProjectsPage {
  readonly cards;
  readonly count;
  readonly typeGroup;
  readonly techGroup;
  readonly empty;

  constructor(private readonly page: Page) {
    this.cards = page.locator('main ul.cards > li');
    this.count = page.locator('main .count');
    this.typeGroup = page.getByRole('group', { name: 'Project type' });
    this.techGroup = page.getByRole('group', { name: 'Tech' });
    this.empty = page.locator('main .empty');
  }

  type(label: 'All' | 'Client' | 'Personal') {
    return this.typeGroup.getByRole('button', { name: label, exact: true });
  }

  tech(name: string) {
    return this.techGroup.getByRole('button', { name, exact: true });
  }

  clearFilters() {
    return this.page.getByRole('button', { name: 'Clear filters' }).first();
  }
}
