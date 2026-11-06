# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **static Angular 21 portfolio** for Ramkumar Karuppaiah — prerendered with `@angular/ssr`, no backend. The design, content, and page specs live in `../portfolio-plan` (external to this repo). Developer conventions and test how-to are in `DEVELOPER_GUIDE.md`.

## Stack

- Angular 21 (zoneless, standalone components, signals)
- Static prerender via `@angular/ssr` (`RenderMode.Prerender`)
- SCSS with CSS custom properties (design tokens)
- Content as JSON files validated by zod schemas
- Unit tests: Vitest via `@angular/build:unit-test` (jsdom)
- E2E tests: Playwright + `@axe-core/playwright` against the static build
- Hosting: Cloudflare Pages; contact form via Formspree

## Commands

| Command | What it does |
|---|---|
| `npm start` | Dev server at http://localhost:4200 |
| `npm run build` | Prerendered static site in `dist/rkram-portfolio/browser` (+ `404.html`) |
| `npm run watch` | Watch mode build for development |
| `npm test` | Vitest in watch mode |
| `npm run test:ci` | Vitest once, with coverage thresholds (80% statements / 75% branches) |
| `npm run lint` | ESLint (TypeScript + template accessibility rules) |
| `npm run e2e` | Build, then run Playwright in all 4 browser projects |
| `npm run e2e:ui` | Playwright UI mode (needs existing build) |
| `npm run e2e:report` | Open last HTML report |
| `npm run resume` | Build résumé deck (separate script) |

### First Run

```bash
nvm use            # Node 20.19+ (see .nvmrc)
npm ci
npx playwright install   # once, for E2E browsers
npm start          # http://localhost:4200
```

## Project Structure

```
src/
  styles/              _tokens (colors, fonts, spacing), _breakpoints, _base, _buttons
  app/
    app.routes.ts      routes, titles; app.routes.server.ts = prerender config
    core/              site.ts (SITE_URL, FORMSPREE_ID), nav-links.ts,
                       services/ (Content, Theme), models/ (zod schemas, TECH list)
    data/              profile, experience, projects, skills, credentials, writing (.json)
    shared/            header, footer, section, chip, stats, project-card, appButton, pipes
    pages/<route>/     one folder per route: .ts + .html + .scss + .spec.ts
e2e/
  data.ts              JSON content + ROUTES table used by assertions
  fixtures.ts          extended test: network block, consoleErrors, axe; helpers
  pages/               page objects (header, projects, contact)
  specs/               one spec per page + shell, a11y, seo
scripts/postbuild.mjs  copies the prerendered /404 to 404.html
```

## Key Architecture Points

### Routing & Prerendering
- Routes defined in `src/app/app.routes.ts` with lazy-loaded components
- Prerender configuration in `src/app/app.routes.server.ts`
- Static output mode in `angular.json` (`outputMode: "static"`)
- Postbuild script copies `/404/index.html` → `/404.html` for Cloudflare Pages

### Content System
- All content lives in JSON files under `src/app/data/`
- Validated at test time by zod schemas in `src/app/core/models/content.schema.ts`
- `Content` service provides readonly signals for each content type
- Derived values computed via `computed()` (years experience, tech counts, etc.)
- Token replacement in text: `{years}`, `{angularYears}`, `{clients}`

### Tech Vocabulary
- Controlled list in `src/app/core/models/tech.ts` (`TECH` const)
- Used as `z.enum(TECH)` in schemas — versions go in `versions` field, never here
- Single source of truth for all tech chips/filters

### Theming
- `Theme` service reads initial theme from inline script in `index.html`
- Light/dark via `html[data-theme]` attribute and CSS custom properties
- Persists to `localStorage` (key: `theme`)
- Respects `prefers-color-scheme` for initial load

## Conventions

### TypeScript
- **Components**: standalone, `ChangeDetectionStrategy.OnPush`, separate `.html`/`.scss` files
- **DI/State**: Use `inject()` rather than constructor params; signals (`signal`, `computed`, `input()`, `output()`, `model()`) over RxJS
- **Visibility**: Template-only members are `protected readonly`
- **No browser globals at prerender**: Guard `window`/`localStorage` with `isPlatformBrowser` or `afterNextRender`
- **Typing**: Strict mode; no `any`; content types from zod schemas
- **Naming**: kebab-case files without suffixes (`project-card.ts` → `class ProjectCard`); selectors use `app-` prefix
- **Imports**: Angular first, then third-party, then relative (blank line between groups)

### HTML (Templates)
- **Semantic first**: `header`/`nav`/`main`/`section`/`article`/`footer`, real `<button>` for actions, `<a routerLink>` for nav
- **One `<h1>` per page**, no skipped heading levels
- **Built-in control flow**: `@if`, `@for (x of xs; track x.id)`, `@empty` — no `*ngIf`/`*ngFor`
- **Accessibility**: alt on images, `aria-hidden="true"` on decorative icons, `aria-pressed`/`aria-expanded` on toggles, `aria-describedby` + `aria-invalid` on form errors, `aria-live` for status messages
- **External links**: `target="_blank" rel="noopener noreferrer"` + visually hidden "(opens in new tab)"
- **Content from data**: Never hard-code copy that exists in JSON; read via `Content` service
- **No PII**: Never commit client names, addresses, DOB, passport, etc.

### CSS (SCSS)
- **Use tokens**: Colors (`var(--bg|--surface|--border|--text|--text-muted|--primary|--accent)`), spacing (`var(--space-1…8)`), fonts (`var(--font-heading|--font-body|--font-mono)`), `--radius`, `--transition`
- **Mobile-first**: Base styles for small screens, then `@include bp.up(sm|md|lg)` (640/960/1200px)
- **Component-scoped**: Global rules only in `src/styles/`. Prefer logical properties (`margin-inline`, `inline-size`, `padding-block`)
- **No 320px overflow**: E2E fails if any page scrolls sideways at 320px — `white-space: nowrap` must wrap in grids, flex children need `min-inline-size: 0`
- **Centered text**: `_base.scss` limits `p` to `max-inline-size: 70ch`; center with `margin-inline: auto` + `text-align: center`
- **Reduced motion**: Respect `prefers-reduced-motion` for animations
- **Contrast**: WCAG AA in both themes (axe checks)

## Testing

### Unit Tests (Vitest)
```bash
npm test             # watch mode
npm run test:ci      # single run + coverage (report in coverage/)
```
- Specs next to code as `*.spec.ts`
- Use `TestBed` with `provideZonelessChangeDetection()` (default) and `fixture.whenStable()`
- Query by role/text as user would; test behavior, not private members
- `content.schema.spec.ts` validates every JSON file — fix data, not test

### E2E Tests (Playwright)
```bash
npm run e2e                                    # build + all 4 projects
npx playwright test --project=desktop-chrome   # one browser (needs build)
npx playwright test e2e/specs/contact.spec.ts  # one file
npx playwright test -g "theme"                 # by test name
npm run e2e:ui                                 # interactive
npm run e2e:report                             # last HTML report
```
- `playwright.config.ts` serves `dist/rkram-portfolio/browser` on port **4300** via `http-server` — **build first**
- No SPA fallback — unknown URLs return real 404 (matches Cloudflare Pages)
- Projects: `desktop-chrome`, `desktop-firefox`, `mobile-safari` (iPhone 13), `mobile-chrome` (Pixel 7)
- Import `test`/`expect` from `e2e/fixtures.ts` (gives network blocking, `consoleErrors`, `axe` fixtures)
- Open pages with `gotoReady(page, path)`
- Locators: prefer `getByRole` and `getByLabel`
- Expected values from `e2e/data.ts`, never hard-coded
- Never click external links; assert attributes with `expectExternalSafe(link)`
- Mock Formspree with `page.route('https://formspree.io/**', …)`
- Use `isMobile` to branch on mobile/desktop behavior differences

### Known E2E Gaps
- Canonical/OG test in `seo.spec.ts` is `test.fixme` until tags are added
- Contact success/error tests skip while `FORMSPREE_ID` is empty

### Troubleshooting
- `EPERM`/`EADDRINUSE` on port 4300: `netstat -ano | findstr :4300` → `taskkill /PID <pid> /F`
- Firefox `RenderCompositorSWGL` crashes: run fewer workers (`--workers=2`)
- Failures save screenshot + trace in `test-results/`; view with `npx playwright show-trace <zip>`

## Pre-Push Checklist

```bash
npm run lint && npm run test:ci && npm run e2e
```
CI (`.github/workflows/ci.yml`) runs the same steps and uploads `playwright-report/` when E2E fails.

## Adding a Page

1. `ng g c pages/<name>`
2. Add route with `title` in `app.routes.ts`; add nav entry in `core/nav-links.ts` if needed
3. Set meta description with `Meta.updateTag`
4. Add unit spec, then E2E spec in `e2e/specs/`, add route to `ROUTES` in `e2e/data.ts` (shell, a11y, seo specs cover it automatically)

## Dependencies

- Pinned to exact versions (`.npmrc` → `save-exact`)
- Upgrade with `ng update`
- Never commit `me.txt`, résumé deck, or any file with PII (already in `.gitignore`)

## File Generation

- Generate code with CLI: `ng g c`, `ng g s`, `ng g p`
- Components default to `OnPush` + SCSS (configured in `angular.json` schematics)