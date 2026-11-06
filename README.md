# rkram-portfolio

Static Angular portfolio for Ramkumar Karuppaiah — prerendered, no backend. Design, content and page specs live in [`../portfolio-plan`](../portfolio-plan/README.md).

Developer conventions and test how-to: [`DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md).

## Stack
Angular 21 (zoneless, standalone, signals) · `@angular/ssr` static prerender · SCSS design tokens · Vitest · ESLint. Node 20.19+ (see `.nvmrc`).

## Scripts
| Command | What it does |
|---|---|
| `npm start` | Dev server at http://localhost:4200 |
| `npm run build` | Prerendered static site in `dist/rkram-portfolio/browser` (+ `404.html`) |
| `npm test` | Vitest in watch mode |
| `npm run test:ci` | Vitest once, with coverage thresholds (80% statements / 75% branches) |
| `npm run lint` | ESLint (TypeScript + template accessibility rules) |

## Structure
```
src/
  styles/            design tokens, breakpoints, base styles
  app/
    core/            services (Theme, Content), zod content schemas, TECH vocabulary, nav links
    data/            content JSON (profile, experience, projects, skills), validated by content.schema.spec.ts
    shared/          header, footer, section, chip, stats, project-card, appButton directive, pipes (ymRange, duration)
    pages/           one folder per route, incl. home, not-found; experience/career-timeline
scripts/postbuild.mjs  copies the prerendered /404 to 404.html
```

## Conventions
- Generate code with the CLI (`ng g c`, `ng g s`, `ng g p`); components default to `OnPush` + SCSS.
- Dependencies are pinned to exact versions (`.npmrc` → `save-exact`). Upgrade with `ng update`.
- Never commit `me.txt`, the résumé deck or any file with PII (already in `.gitignore`).
