import { RenderMode, ServerRoute } from '@angular/ssr';

import projects from './data/projects.json';

export const serverRoutes: ServerRoute[] = [
  {
    // One static page per case study; unknown slugs fall through to 404.html.
    path: 'projects/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => projects.map((p) => ({ slug: p.slug })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
