import { FORMSPREE_ID } from '../../src/app/core/site';
import { profile } from '../data';
import { expect, expectExternalSafe, gotoReady, test } from '../fixtures';
import { ContactPage } from '../pages/contact.page';

test.describe('contact', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/contact');
  });

  test('submitting an empty form flags every required field', async ({ page }) => {
    const c = new ContactPage(page);
    await c.submit.click();

    for (const [field, id] of [
      [c.name, 'c-name-err'],
      [c.email, 'c-email-err'],
      [c.message, 'c-message-err'],
    ] as const) {
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      await expect(field).toHaveAttribute('aria-describedby', id);
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    await expect(c.subject).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('errors appear after leaving a field', async ({ page }) => {
    const c = new ContactPage(page);
    await c.name.focus();
    await c.email.focus();
    await expect(page.locator('#c-name-err')).toBeVisible();
  });

  test('rejects an invalid email', async ({ page }) => {
    const c = new ContactPage(page);
    await c.email.fill('not-an-email');
    await c.email.blur();
    await expect(page.locator('#c-email-err')).toHaveText('Please enter a valid email address.');
  });

  test('message must be 20–2000 characters', async ({ page }) => {
    const c = new ContactPage(page);
    const err = page.locator('#c-message-err');

    await c.message.fill('x'.repeat(19));
    await c.message.blur();
    await expect(err).toBeVisible();

    await c.message.fill('x'.repeat(20));
    await expect(err).toBeHidden();

    await c.message.fill('x'.repeat(2001));
    await expect(err).toBeVisible();
  });

  test('honeypot is hidden from people and assistive tech', async ({ page }) => {
    const c = new ContactPage(page);
    await expect(page.locator('.honeypot')).toHaveAttribute('aria-hidden', 'true');
    await expect(c.honeypot).toHaveAttribute('tabindex', '-1');
    await expect(c.honeypot).not.toBeInViewport();
  });

  test('without a Formspree ID, submit shows the mailto fallback and sends nothing', async ({ page }) => {
    test.skip(!!FORMSPREE_ID, 'FORMSPREE_ID is configured');
    const c = new ContactPage(page);
    let requests = 0;
    await page.route('https://formspree.io/**', (r) => {
      requests++;
      return r.fulfill({ status: 200, body: '{}' });
    });

    await c.fillValid();
    await c.submit.click();

    await expect(c.status.locator('.error')).toContainText("couldn't be sent");
    await expect(c.status.getByRole('link', { name: profile.email })).toHaveAttribute('href', `mailto:${profile.email}`);
    expect(requests).toBe(0);
  });

  test('success: shows thanks, resets the form and focuses the status', async ({ page }) => {
    test.skip(!FORMSPREE_ID, 'FORMSPREE_ID is empty in src/app/core/site.ts');
    const c = new ContactPage(page);
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    await page.route('https://formspree.io/**', async (r) => {
      await gate;
      await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await c.fillValid();
    await c.submit.click();
    await expect(c.submit).toBeDisabled();
    await expect(c.submit).toHaveText('Sending…');
    release();

    await expect(c.status.locator('.ok')).toBeVisible();
    await expect(c.name).toHaveValue('');
    await expect(c.status).toBeFocused();
  });

  test('error: server failure shows the mailto fallback', async ({ page }) => {
    test.skip(!FORMSPREE_ID, 'FORMSPREE_ID is empty in src/app/core/site.ts');
    const c = new ContactPage(page);
    await page.route('https://formspree.io/**', (r) => r.fulfill({ status: 500, body: '{}' }));

    await c.fillValid();
    await c.submit.click();
    await expect(c.status.locator('.error')).toBeVisible();
    await expect(c.submit).toBeEnabled();
  });

  test('direct links are present and safe', async ({ page }) => {
    const aside = page.getByRole('complementary');
    await expect(aside.getByRole('link', { name: profile.email })).toHaveAttribute('href', `mailto:${profile.email}`);
    for (const [name, href] of [
      ['LinkedIn', profile.links.linkedin],
      ['GitHub', profile.links.github],
      ['Blog', profile.links.blog],
    ]) {
      const link = aside.getByRole('link', { name: new RegExp(`^${name}`) });
      await expect(link).toHaveAttribute('href', href!);
      await expectExternalSafe(link);
    }
    await expect(aside.getByRole('link', { name: 'Resume (PDF)' })).toHaveAttribute('download', '');
  });
});
