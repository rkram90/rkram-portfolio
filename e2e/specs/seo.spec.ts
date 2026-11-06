import { SITE_URL } from '../../src/app/core/site';
import { profile, ROUTES } from '../data';
import { expect, test } from '../fixtures';

// Reads raw prerendered HTML (no JavaScript), as search engines and link previews see it.
// Browser-independent, so it runs in one project only.
test.describe('seo (raw HTML)', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome', 'runs once');
  });

  const meta = (html: string, attr: 'name' | 'property', key: string) =>
    html.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`))?.[1] ??
    html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${key}"`))?.[1];

  test('every route has a unique title and a description', async ({ request }) => {
    const titles = new Set<string>();
    for (const r of ROUTES) {
      const html = await (await request.get(r.path)).text();
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
      expect(title, r.path).toBe(r.title.replace(/&/g, '&amp;'));
      titles.add(title!);
      expect(meta(html, 'name', 'description'), r.path).toBeTruthy();
      expect(meta(html, 'name', 'robots'), r.path).not.toBe('noindex');
    }
    expect(titles.size).toBe(ROUTES.length);
  });

  test('home has Open Graph tags and Person JSON-LD', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(meta(html, 'property', 'og:title')).toContain(profile.name);
    expect(meta(html, 'property', 'og:url')).toBe(`${SITE_URL}/`);
    const ld = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    expect(ld).toBeTruthy();
    const json = JSON.parse(ld!);
    expect(json['@type']).toBe('Person');
    expect(json.name).toBe(profile.name);
  });

  test('404 page is noindex', async ({ request }) => {
    const res = await request.get('/does-not-exist');
    expect(res.status()).toBe(404);
    expect(meta(await res.text(), 'name', 'robots')).toBe('noindex');
  });

  // App gap (docs 08 §5): no canonical link or per-route og:* tags yet. Remove fixme once added.
  test.fixme('every route has a canonical URL and og:title', async ({ request }) => {
    for (const r of ROUTES) {
      const html = await (await request.get(r.path)).text();
      expect(html, r.path).toContain(`<link rel="canonical" href="${SITE_URL}${r.path === '/' ? '/' : r.path}"`);
      expect(meta(html, 'property', 'og:title'), r.path).toBeTruthy();
    }
  });
});
