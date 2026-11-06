import { projects } from '../data';
import { expect, gotoReady, hasHorizontalScroll, test } from '../fixtures';
import { ProjectsPage } from '../pages/projects.page';

const count = (n: number) => new RegExp(`^\\s*${n} ${n === 1 ? 'project' : 'projects'}`);
const withTech = (...tech: string[]) => projects.filter((p) => tech.every((t) => (p.tech as string[]).includes(t)));

test.describe('projects', () => {
  test('lists every project by default', async ({ page }) => {
    const p = new ProjectsPage(page);
    await gotoReady(page, '/projects');
    await expect(p.cards).toHaveCount(projects.length);
    await expect(p.count).toHaveText(count(projects.length));
    await expect(p.type('All')).toHaveAttribute('aria-pressed', 'true');
  });

  test('type toggle narrows cards and updates the URL', async ({ page }) => {
    const p = new ProjectsPage(page);
    await gotoReady(page, '/projects');

    await p.type('Client').click();
    await expect(p.type('Client')).toHaveAttribute('aria-pressed', 'true');
    await expect(p.cards).toHaveCount(projects.filter((x) => x.type === 'client').length);
    await expect(page).toHaveURL(/[?&]type=client/);

    await p.type('Personal').click();
    await expect(p.cards).toHaveCount(projects.filter((x) => x.type === 'personal').length);
  });

  test('tech filters combine with AND, sync to URL and survive reload', async ({ page }) => {
    const p = new ProjectsPage(page);
    await gotoReady(page, '/projects');

    await p.tech('AWS').click();
    await expect(p.cards).toHaveCount(withTech('AWS').length);
    await p.tech('.NET').click();
    await expect(p.cards).toHaveCount(withTech('AWS', '.NET').length);
    await expect(p.tech('AWS')).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/tech=AWS(%2C|,)\.NET/);

    await page.reload();
    await expect(p.tech('.NET')).toHaveAttribute('aria-pressed', 'true');
    await expect(p.cards).toHaveCount(withTech('AWS', '.NET').length);
  });

  test('deep link pre-selects filters and ignores unknown tech', async ({ page }) => {
    const p = new ProjectsPage(page);
    await gotoReady(page, '/projects?tech=Node.js,NotATech');
    await expect(p.tech('Node.js')).toHaveAttribute('aria-pressed', 'true');
    await expect(p.cards).toHaveCount(withTech('Node.js').length);
  });

  test('impossible combination shows the empty state; clear resets', async ({ page }) => {
    const p = new ProjectsPage(page);
    await gotoReady(page, '/projects?type=personal&tech=Python');
    await expect(p.cards).toHaveCount(0);
    await expect(p.empty).toBeVisible();
    await expect(p.count).toHaveText(count(0));

    await p.clearFilters().click();
    await expect(p.cards).toHaveCount(projects.length);
    await expect(page).toHaveURL('/projects');
  });

  test('card opens the case study', async ({ page }) => {
    await gotoReady(page, '/projects');
    await page.getByRole('link', { name: projects[1].title, exact: true }).click();
    await expect(page).toHaveURL(`/projects/${projects[1].slug}`);
  });

  test('filter chips do not cause page overflow on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await gotoReady(page, '/projects');
    expect(await hasHorizontalScroll(page)).toBe(false);
  });
});
