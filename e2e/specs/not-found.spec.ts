import { expect, test } from '../fixtures';

for (const path of ['/does-not-exist', '/projects/unknown-slug']) {
  test.describe(`not found: ${path}`, () => {
    test('returns HTTP 404 with the 404 page', async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.locator('main h1')).toHaveText('Page not found');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    });

    test('recovery links work', async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      for (const [name, url] of [
        ['Home', '/'],
        ['Projects', '/projects'],
        ['Contact', '/contact'],
      ]) {
        await expect(page.locator('main').getByRole('link', { name, exact: true })).toHaveAttribute('href', url);
      }
      await page.locator('main').getByRole('link', { name: 'Projects', exact: true }).click();
      await expect(page).toHaveURL('/projects');
    });
  });
}
