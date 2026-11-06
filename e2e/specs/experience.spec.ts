import { experience, profile } from '../data';
import { expect, gotoReady, test } from '../fixtures';

/** Whole years since a YYYY-MM date, like ContentService.yearsExperience (prerendered at build time). */
function yearsSince(ym: string, now = new Date()): number {
  const [y, m] = ym.split('-').map(Number);
  return Math.floor((now.getFullYear() * 12 + now.getMonth() - (y * 12 + m - 1)) / 12);
}

test.describe('experience', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/experience');
  });

  test('lead shows years of experience from careerStart', async ({ page }) => {
    // The value is baked in at build time, so allow the build to be up to a year old.
    const years = yearsSince(profile.careerStart);
    await expect(page.locator('main .lead')).toHaveText(new RegExp(`^(${years}|${years - 1}) years`));
  });

  test('one row per employer, in data order', async ({ page }) => {
    await expect(page.locator('.rows > li.row h2')).toHaveText(experience.map((e) => e.company));
  });

  test('first engagement is open; summaries toggle', async ({ page }) => {
    const details = page.locator('details.engagement');
    const total = experience.reduce((n, e) => n + ((e as { engagements?: unknown[] }).engagements?.length ?? 0), 0);
    await expect(details).toHaveCount(total);
    await expect(details.first()).toHaveAttribute('open', '');
    await expect(details.nth(1)).not.toHaveAttribute('open', '');

    await details.nth(1).locator('summary').click();
    await expect(details.nth(1)).toHaveAttribute('open', '');
    await expect(details.nth(1).locator('ul.chips app-chip').first()).toBeVisible();
  });

  test('timeline track is decorative', async ({ page }) => {
    await expect(page.locator('.timeline .track')).toHaveAttribute('aria-hidden', 'true');
  });

  test('layout: meta beside body on desktop, stacked on mobile', async ({ page, isMobile }) => {
    const row = page.locator('.rows > li.row').first();
    const meta = await row.locator('.meta').boundingBox();
    const body = await row.locator('.body').boundingBox();
    if (isMobile) expect(body!.y).toBeGreaterThan(meta!.y + meta!.height - 1);
    else expect(body!.x).toBeGreaterThan(meta!.x + meta!.width - 1);
  });
});
