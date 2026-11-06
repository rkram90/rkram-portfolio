import { profile, writing } from '../data';
import { expect, expectExternalSafe, gotoReady, test } from '../fixtures';

const tier = (t: string) => writing.filter((p) => p.tier === t);

test.describe('writing', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/writing');
  });

  test('featured, series and more counts match writing.json', async ({ page }) => {
    await expect(page.locator('main article.card:not(.series)')).toHaveCount(tier('featured').length);
    const series = writing.filter((p) => (p as { series?: string }).series === 'react-fundamentals');
    await expect(page.locator('ol.series-list li')).toHaveCount(series.length);
    await expect(page.locator('main .series > p').first()).toContainText(`${series.length} short posts`);
    await expect(page.locator('ul.more li')).toHaveCount(tier('more').length);
  });

  test('every post link opens safely in a new tab', async ({ page }) => {
    const links = page.locator('main a[href^="http"]');
    expect(await links.count()).toBeGreaterThan(writing.length); // posts + category + blog
    for (const link of await links.all()) await expectExternalSafe(link);
  });

  test('dates use YYYY-MM datetime attributes', async ({ page }) => {
    for (const t of await page.locator('main time').all()) {
      await expect(t).toHaveAttribute('datetime', /^\d{4}-\d{2}$/);
    }
  });

  test('links to the full blog', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Visit the full blog/ })).toHaveAttribute('href', profile.links.blog!);
  });
});
