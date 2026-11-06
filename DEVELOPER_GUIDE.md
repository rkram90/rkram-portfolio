# Developer guide

How this project is set up, the conventions for HTML, SCSS and TypeScript, and how to run the unit and end-to-end tests. For product, design and per-page specs, see [`../portfolio-plan`](../portfolio-plan/README.md).

## 1. Project setup

| Item | Choice |
|---|---|
| Framework | Angular 21: standalone components, zoneless, signals |
| Rendering | Static prerender (`@angular/ssr`, `RenderMode.Prerender`); there is no backend |
| Styles | SCSS with CSS custom properties (design tokens) |
| Content | JSON files in `src/app/data/`, validated by zod schemas |
| Unit tests | Vitest via `@angular/build:unit-test` (jsdom) |
| E2E tests | Playwright + `@axe-core/playwright`, run against the static build |
| Hosting | Cloudflare Pages; contact form via Formspree |

### First run
```bash
nvm use            # Node 20.19+ (see .nvmrc)
npm ci
npx playwright install   # once, for E2E browsers
npm start          # http://localhost:4200
```

### Folder layout
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

### Scripts
| Command | What it does |
|---|---|
| `npm start` | Dev server with live reload |
| `npm run build` | Prerendered site in `dist/rkram-portfolio/browser` (+ `404.html`) |
| `npm run lint` | ESLint (TypeScript and template accessibility rules) |
| `npm test` | Vitest in watch mode |
| `npm run test:ci` | Vitest once, with coverage thresholds |
| `npm run e2e` | Build, then run Playwright in all 4 browser projects |
| `npm run e2e:ui` | Playwright UI mode (needs an existing build) |
| `npm run e2e:report` | Open the last HTML report |

## 2. Writing HTML (templates)

- **Semantic first.** Use `header`/`nav`/`main`/`section`/`article`/`footer`, real `<button>` for actions and `<a routerLink>` for navigation. Each page has exactly one `<h1>`, and headings never skip levels.
- **Built-in control flow:** `@if`, `@for (x of xs; track x.id)`, `@empty`. Don't use `*ngIf`/`*ngFor`.
- **Accessibility:**
  - Every image has an `alt` (use `alt=""` when it's decorative).
  - Hide decorative icons with `aria-hidden="true"`.
  - Toggle buttons use `aria-pressed`; disclosure toggles use `aria-expanded`.
  - Form errors are linked to their field via `aria-describedby` and set `aria-invalid="true"`.
  - Status messages that change go in an `aria-live` region.
- **External links:** `target="_blank" rel="noopener noreferrer"` plus visually hidden text "(opens in new tab)". E2E checks this (`expectExternalSafe`).
- **Content comes from data.** Don't hard-code copy that already exists in `src/app/data/*.json`; read it through the `Content` service.
- **Never** put client names or personal data (address, DOB, passport, etc.) in templates, data or commits.

```html
<app-section heading="Featured projects">
  @for (p of featured; track p.slug) {
    <app-project-card [project]="p" />
  } @empty {
    <p>No projects yet.</p>
  }
</app-section>
```

## 3. Writing CSS (SCSS)

- **Use tokens, not raw values.** Colors: `var(--bg | --surface | --border | --text | --text-muted | --primary | --accent)`. Spacing: `var(--space-1…8)`. Fonts: `var(--font-heading | --font-body | --font-mono)`. Also `--radius` and `--transition`. Light and dark themes come from `html[data-theme]`, so tokens handle both automatically.
- **Mobile-first.** Write base styles for small screens, then add `@include bp.up(sm | md | lg)` (640 / 960 / 1200px):
  ```scss
  @use 'styles/breakpoints' as bp;
  .grid {
    display: grid;
    gap: var(--space-3);
    @include bp.up(md) { grid-template-columns: repeat(3, 1fr); }
  }
  ```
- **Styles are component-scoped.** Put global rules only in `src/styles/`. Prefer logical properties (`margin-inline`, `inline-size`, `padding-block`).
- **Avoid 320px overflow.** E2E fails if any page scrolls sideways at 320px.
  - `white-space: nowrap` text (such as chips) must be allowed to wrap inside grids.
  - Flex children with long content need `min-inline-size: 0`.
- **Centered text:** `_base.scss` limits `p` to `max-inline-size: 70ch`. To center a paragraph, add `margin-inline: auto` as well as `text-align: center`.
- Respect `prefers-reduced-motion` for any animation. Keep contrast WCAG AA; axe checks both themes.

## 4. Writing TypeScript

- **Components:** standalone, `ChangeDetectionStrategy.OnPush`, and separate `.html` / `.scss` files. Generate them with `ng g c pages/<name>`.
- **DI and state:**
  - Use `inject()` rather than constructor parameters.
  - Use signals (`signal`, `computed`, `input()`, `output()`, `model()`) rather than RxJS where possible.
  - Members used only by the template are `protected readonly`.
- **No browser globals at prerender time.** Code runs in Node during the build, so guard `window`/`localStorage` with `isPlatformBrowser` or `afterNextRender`.
- **Typing:**
  - Strict mode; no `any`.
  - Content types come from the zod schemas in `core/models/content.schema.ts`. If you add a JSON field, update the schema first.
- **Naming:** files are kebab-case without suffixes (`project-card.ts` → `class ProjectCard`), and selectors use the `app-` prefix.
- **Imports:** Angular first, then third-party, then relative, with a blank line between groups. Dependency versions are pinned exactly.

```ts
@Component({
  selector: 'app-chip',
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chip {
  readonly version = input<string>();
}
```

### Adding a page
1. `ng g c pages/<name>`
2. Add the route with a `title` in `app.routes.ts`. Add a nav entry in `core/nav-links.ts` if it needs one.
3. Set the meta description with `Meta.updateTag`.
4. Add a unit spec, then an E2E spec in `e2e/specs/`, and add the route to `ROUTES` in `e2e/data.ts`. The shell, a11y and seo specs then cover it automatically.

## 5. Unit tests (Vitest)

```bash
npm test             # watch mode
npm run test:ci      # single run + coverage (report in coverage/)
```
- Specs live next to the code as `*.spec.ts`.
- Use `TestBed` with `provideZonelessChangeDetection()` (already the default) and `fixture.whenStable()`.
- Query by role or text, as a user would. Test behavior, not private members.
- `content.schema.spec.ts` validates every JSON file. If it fails, fix the data, not the test.

## 6. End-to-end tests (Playwright)

```bash
npm run e2e                                    # build + all projects
npx playwright test --project=desktop-chrome   # one browser (needs a build)
npx playwright test e2e/specs/contact.spec.ts  # one file
npx playwright test -g "theme"                 # by test name
npm run e2e:ui                                 # interactive
npm run e2e:report                             # last HTML report
```

- **What's being tested:**
  - `playwright.config.ts` serves `dist/rkram-portfolio/browser` on port **4300** with `http-server`, so **build first**.
  - It deliberately has no SPA fallback, so unknown URLs return a real 404, as on Cloudflare Pages.
- **Projects:** `desktop-chrome`, `desktop-firefox`, `mobile-safari` (iPhone 13), `mobile-chrome` (Pixel 7).
- **Writing a spec:**
  - Import `test` and `expect` from `e2e/fixtures.ts`, not from `@playwright/test`. That gives you external-network blocking plus the `consoleErrors` and `axe` fixtures.
  - Open pages with `gotoReady(page, path)`.
  - Locators: prefer `getByRole` and `getByLabel`.
  - Take expected values from `e2e/data.ts`, never hard-coded copy.
  - Never click external links. Assert their attributes with `expectExternalSafe(link)`.
  - Mock Formspree with `page.route('https://formspree.io/**', …)`.
  - Use `isMobile` to branch on behavior that differs between mobile and desktop.
- **Known gaps:** the canonical/OG test in `seo.spec.ts` is `test.fixme` until those tags are added. The contact success and error tests skip while `FORMSPREE_ID` is empty.
- **Troubleshooting:**
  - `EPERM`/`EADDRINUSE` on build or test: an old server is still on port 4300. Find it with `netstat -ano | findstr :4300`, then run `taskkill /PID <pid> /F`.
  - Firefox `RenderCompositorSWGL` crashes locally: run fewer workers (`--workers=2`).
  - Failures save a screenshot and trace in `test-results/`. View a trace with `npx playwright show-trace <zip>`.

## 7. Before you push

```bash
npm run lint && npm run test:ci && npm run e2e
```
CI (`.github/workflows/ci.yml`) runs the same steps and uploads `playwright-report/` when E2E fails.
