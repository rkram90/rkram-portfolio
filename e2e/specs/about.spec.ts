import { profile } from '../data';
import { expect, gotoReady, test } from '../fixtures';

test.describe('about', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/about');
  });

  test('portrait loads with a descriptive alt', async ({ page }) => {
    const img = page.locator('section.intro img');
    await expect(img).toHaveAttribute('alt', `Portrait of ${profile.name}`);
    expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  });

  test('all sections render from data', async ({ page }) => {
    for (const h of ['My story', 'How I work', "What I'm looking for", 'Currently learning', 'Beyond work']) {
      await expect(page.getByRole('heading', { level: 2, name: h })).toBeVisible();
    }
    await expect(page.locator('p.story')).toHaveCount(profile.about.length);
    await expect(page.locator('ul.open-to app-chip')).toHaveText(profile.openTo);
    await expect(page.locator('ul.beyond li')).toHaveCount(profile.beyondWork.length);
  });

  test('CTAs: resume download and contact', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Download resume (PDF)' })).toHaveAttribute('download', '');
    await page.locator('main .ctas').getByRole('link', { name: 'Get in touch' }).click();
    await expect(page).toHaveURL('/contact');
  });
});
