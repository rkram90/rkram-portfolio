import { projects, skills } from '../data';
import { expect, gotoReady, test } from '../fixtures';

const usedTech = new Set(projects.flatMap((p) => p.tech));

test.describe('skills', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/skills');
  });

  test('one section per skill group', async ({ page }) => {
    await expect(page.locator('main section.group h2')).toHaveText(skills.map((g) => g.label), { useInnerText: true });
  });

  test('core skills are marked with an accessible star', async ({ page }) => {
    const core = skills.flatMap((g) => g.skills).filter((s) => (s as { core?: boolean }).core);
    await expect(page.locator('main li.core')).toHaveCount(core.length);
    await expect(page.locator('main li.core [role="img"][aria-label="core skill"]')).toHaveCount(core.length);
  });

  test('skill used by a project links to the filtered projects list', async ({ page }) => {
    const name = skills.flatMap((g) => g.skills).find((s) => usedTech.has(s.name))!.name;
    await page.locator('main section.group a', { hasText: name }).first().click();
    await expect(page).toHaveURL(new RegExp(`/projects\\?tech=${encodeURIComponent(name).replace(/\./g, '\\.')}`));
    await expect(page.getByRole('group', { name: 'Tech' }).getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  test('"See these in action" links to projects', async ({ page }) => {
    await page.getByRole('link', { name: 'See these in action → Projects' }).click();
    await expect(page).toHaveURL('/projects');
  });
});
