import { NAV_LINKS } from '../../src/app/core/nav-links';
import { ROUTES } from '../data';
import { expect, expectCentered, gotoReady, hasHorizontalScroll, test } from '../fixtures';
import { HeaderPage } from '../pages/header';

test.describe('shell: navigation', () => {
  for (const link of NAV_LINKS) {
    test(`nav "${link.label}" opens ${link.path}`, async ({ page, isMobile }) => {
      const header = new HeaderPage(page);
      const route = ROUTES.find((r) => r.path === link.path)!;
      await gotoReady(page, '/');
      if (isMobile) await header.menuToggle.click();

      await header.navLink(link.label).click();

      await expect(page).toHaveURL(link.path);
      await expect(page.locator('main h1')).toHaveText(route.h1);
      await expect(page).toHaveTitle(route.title);
      if (isMobile) await header.menuToggle.click();
      await expect(header.navLink(link.label)).toHaveAttribute('aria-current', 'page');
    });
  }

  test('brand link returns home', async ({ page }) => {
    await gotoReady(page, '/about');
    await new HeaderPage(page).brand.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('shell: header layout', () => {
  test('desktop shows inline nav and hides the menu toggle', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    const header = new HeaderPage(page);
    await gotoReady(page, '/');
    await expect(header.nav).toBeVisible();
    await expect(header.menuToggle).toBeHidden();
  });

  test('mobile menu opens, traps focus, closes on Esc and on navigation', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    const header = new HeaderPage(page);
    await gotoReady(page, '/');

    await expect(header.menuToggle).toHaveAttribute('aria-expanded', 'false');
    await header.menuToggle.click();
    await expect(header.menuToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(header.navLink('Contact')).toBeVisible();

    // Tab from the last focusable element wraps to the first one in the header.
    await header.menuToggle.focus();
    await page.keyboard.press('Tab');
    await expect(header.brand).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(header.menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(header.menuToggle).toBeFocused();

    await header.menuToggle.click();
    await header.navLink('Skills').click();
    await expect(page).toHaveURL('/skills');
    await expect(header.menuToggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('shell: theme', () => {
  test('toggle flips data-theme and persists across reload', async ({ page }) => {
    const header = new HeaderPage(page);
    await gotoReady(page, '/');
    const before = await header.theme();
    const after = before === 'dark' ? 'light' : 'dark';

    await header.themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', after);
    await expect(header.themeToggle).toHaveAccessibleName(after === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(after);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', after);
  });

  test('defaults to the OS color scheme when nothing is stored', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await gotoReady(page, '/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('shell: footer', () => {
  test('shows the current year and is centered', async ({ page }) => {
    await gotoReady(page, '/');
    const text = page.locator('footer.site-footer p');
    await expect(text).toContainText(`© ${new Date().getFullYear()}`);
    await expectCentered(page, text);
  });
});

test.describe('shell: every route', () => {
  for (const route of ROUTES) {
    test(`${route.path} has no console errors and no sideways scroll at 320px`, async ({ page, consoleErrors }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await gotoReady(page, route.path);
      expect(await hasHorizontalScroll(page), route.path).toBe(false);
      expect(consoleErrors).toEqual([]);
    });
  }
});
