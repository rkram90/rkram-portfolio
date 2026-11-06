import AxeBuilder from '@axe-core/playwright';
import { expect, test as base, type Locator, type Page } from '@playwright/test';

interface Fixtures {
  /** Console errors and uncaught exceptions collected during the test. */
  consoleErrors: string[];
  /** Runs axe (WCAG 2.1 AA) and returns serious/critical violations. */
  axe: () => Promise<{ id: string; impact?: string | null; nodes: number }[]>;
}

export const test = base.extend<Fixtures>({
  // Block every non-localhost request: tests never depend on the outside network (docs 08 §2).
  // Specs that need Formspree register their own page.route, which takes priority.
  page: async ({ page, baseURL }, use) => {
    await page.route(
      (url) => !url.href.startsWith(baseURL!),
      (route) => route.abort('blockedbyclient'),
    );
    await use(page);
  },

  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      // Aborted external requests (blocked above) are expected noise.
      if (m.type() === 'error' && !/ERR_BLOCKED_BY_CLIENT|blockedbyclient|Failed to load resource/i.test(m.text())) {
        errors.push(m.text());
      }
    });
    page.on('pageerror', (e) => errors.push(e.message));
    await use(errors);
  },

  axe: async ({ page }, use, testInfo) => {
    await use(async () => {
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      if (bad.length) {
        await testInfo.attach('axe-violations.json', { body: JSON.stringify(bad, null, 2), contentType: 'application/json' });
      }
      return bad.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
    });
  },
});

export { expect };

/** Waits for Angular to hydrate/bootstrap so event handlers are attached. */
export async function gotoReady(page: Page, path: string) {
  const res = await page.goto(path);
  await page.locator('app-root main h1').first().waitFor();
  await page.waitForLoadState('networkidle');
  return res;
}

/** True when the page scrolls sideways. */
export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}

/** Asserts a box is horizontally centered in the viewport (±2px) — guards the _base.scss 70ch fix. */
export async function expectCentered(page: Page, locator: Locator) {
  const box = await locator.boundingBox();
  const vw = await page.evaluate(() => document.documentElement.clientWidth);
  expect(box, 'element should be visible').not.toBeNull();
  expect(Math.abs(box!.x + box!.width / 2 - vw / 2)).toBeLessThanOrEqual(2);
}

/** External links must open safely in a new tab and say so to screen readers. */
export async function expectExternalSafe(link: Locator) {
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  await expect(link.locator('.visually-hidden')).toHaveText(/opens in new tab/);
}
