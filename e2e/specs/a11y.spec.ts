import { ROUTES } from '../data';
import { expect, gotoReady, test } from '../fixtures';

const PAGES = [...ROUTES.map((r) => r.path), '/404'];

for (const theme of ['light', 'dark'] as const) {
  test.describe(`a11y (${theme})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
    });

    for (const path of PAGES) {
      test(`${path} has no serious/critical axe violations`, async ({ page, axe }) => {
        await gotoReady(page, path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        expect(await axe()).toEqual([]);
      });
    }
  });
}
