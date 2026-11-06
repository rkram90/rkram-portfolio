import { projectsByOrder } from '../data';
import { expect, gotoReady, test } from '../fixtures';

test.describe('project detail', () => {
  projectsByOrder.forEach((p, i) => {
    test(`/projects/${p.slug} is prerendered and complete`, async ({ page }) => {
      const res = await gotoReady(page, `/projects/${p.slug}`);
      expect(res?.status()).toBe(200);

      await expect(page.locator('main h1')).toHaveText(p.title);
      await expect(page).toHaveTitle(`${p.title} — Case Study`);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', p.tagline);
      await expect(page.locator('main .tagline')).toHaveText(p.tagline);

      for (const h of ['Problem', 'Approach', 'Outcomes']) {
        await expect(page.getByRole('heading', { level: 2, name: h })).toBeVisible();
      }
      await expect(page.locator('section[aria-labelledby="approach"] li')).toHaveCount(p.approach.length);

      const metrics = p.outcomes.filter((o) => 'metric' in o && o.metric).length;
      await expect(page.locator('section[aria-labelledby="outcomes"] app-stats dl > div')).toHaveCount(metrics);

      const hasLinks = p.type === 'personal' && !!(p as { links?: object }).links;
      await expect(page.getByRole('heading', { level: 2, name: 'Links' })).toHaveCount(hasLinks ? 1 : 0);

      // Pager follows `order`: first has no prev, last has no next.
      const pager = page.getByRole('navigation', { name: 'More projects' });
      const prev = projectsByOrder[i - 1];
      const next = projectsByOrder[i + 1];
      await expect(pager.locator('a[rel="prev"]')).toHaveCount(prev ? 1 : 0);
      await expect(pager.locator('a[rel="next"]')).toHaveCount(next ? 1 : 0);
      if (prev) await expect(pager.locator('a[rel="prev"]')).toHaveAttribute('href', `/projects/${prev.slug}`);
      if (next) await expect(pager.locator('a[rel="next"]')).toHaveAttribute('href', `/projects/${next.slug}`);
    });
  });

  test('breadcrumb returns to /projects and pager navigates', async ({ page }) => {
    const [first, second] = projectsByOrder;
    await gotoReady(page, `/projects/${first.slug}`);
    await page.locator('a[rel="next"]').click();
    await expect(page).toHaveURL(`/projects/${second.slug}`);
    await expect(page.locator('main h1')).toHaveText(second.title);

    await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL('/projects');
  });
});
