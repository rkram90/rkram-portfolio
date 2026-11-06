import { credentials } from '../data';
import { expect, expectExternalSafe, gotoReady, test } from '../fixtures';

test.describe('certifications', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/certifications');
  });

  test('sections and item counts match credentials.json', async ({ page }) => {
    const section = (id: string) => page.locator(`#${id}`).locator('xpath=ancestor::section[1]');
    await expect(section('certs').locator('li.card')).toHaveCount(credentials.certifications.length);
    await expect(section('courses').locator('li')).toHaveCount(credentials.courses.length);
    await expect(section('education').locator('li')).toHaveCount(credentials.education.length);
    await expect(section('training').locator('li')).toHaveCount(credentials.training.length);
  });

  test('verify links open safely in a new tab', async ({ page }) => {
    const links = page.getByRole('link', { name: /^Verify/ });
    const expected = credentials.certifications.filter((c) => (c as { url?: string }).url).length;
    await expect(links).toHaveCount(expected);
    for (const link of await links.all()) await expectExternalSafe(link);
  });
});
