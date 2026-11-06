import { profile, projects } from '../data';
import { expect, expectCentered, gotoReady, test } from '../fixtures';

test.describe('home', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/');
  });

  test('hero shows name, headline and summary', async ({ page }) => {
    const hero = page.locator('section.hero');
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText(profile.name);
    await expect(hero.locator('.headline')).toHaveText(profile.headline);
    await expect(hero.locator('.summary')).not.toBeEmpty();
    await expect(hero.locator('.summary')).not.toContainText('{'); // placeholders resolved
  });

  test('resume link downloads an existing PDF', async ({ page, request }) => {
    const resume = page.locator('section.hero').getByRole('link', { name: 'Download resume (PDF)' });
    await expect(resume).toHaveAttribute('download', '');
    const res = await request.get((await resume.getAttribute('href'))!);
    expect(res.status()).toBe(200);
  });

  test('"View projects" goes to /projects', async ({ page }) => {
    await page.getByRole('link', { name: 'View projects' }).click();
    await expect(page).toHaveURL('/projects');
  });

  test('stats match profile data with placeholders resolved', async ({ page }) => {
    const stats = page.locator('app-stats dl > div');
    await expect(stats).toHaveCount(profile.stats.length);
    for (const s of profile.stats) await expect(page.locator('app-stats dt', { hasText: s.label })).toBeVisible();
    await expect(page.locator('app-stats dd')).not.toContainText(['{']);
  });

  test('featured projects match data and open the case study', async ({ page }) => {
    const featured = projects.filter((p) => p.featured);
    const cards = page.locator('#featured').locator('..').locator('ul.cards > li');
    await expect(cards).toHaveCount(featured.length);

    await page.getByRole('link', { name: featured[0].title, exact: true }).click();
    await expect(page).toHaveURL(`/projects/${featured[0].slug}`);
    await expect(page.locator('main h1')).toHaveText(featured[0].title);
  });

  test('"All projects →" goes to /projects', async ({ page }) => {
    await page.getByRole('link', { name: 'All projects →' }).click();
    await expect(page).toHaveURL('/projects');
  });

  test('core stack chips are listed', async ({ page }) => {
    await expect(page.locator('ul.stack app-chip').first()).toBeVisible();
  });

  test('contact CTA is centered and links to /contact', async ({ page }) => {
    const cta = page.locator('section.contact');
    await expectCentered(page, cta.locator('p'));
    await cta.getByRole('link', { name: 'Get in touch' }).click();
    await expect(page).toHaveURL('/contact');
  });
});
