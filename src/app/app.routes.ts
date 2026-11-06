import { Routes } from '@angular/router';

const SITE = 'Ramkumar Karuppaiah';

export const routes: Routes = [
  {
    path: '',
    title: `${SITE} — Technology Lead & Angular Specialist`,
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'about',
    title: `About — ${SITE}`,
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'experience',
    title: `Experience — ${SITE}`,
    loadComponent: () => import('./pages/experience/experience').then((m) => m.Experience),
  },
  {
    path: 'projects',
    title: `Projects — ${SITE}`,
    loadComponent: () => import('./pages/projects/projects').then((m) => m.Projects),
  },
  {
    // Title and description are set per project by the component.
    path: 'projects/:slug',
    loadComponent: () => import('./pages/project-detail/project-detail').then((m) => m.ProjectDetail),
  },
  {
    path: 'skills',
    title: 'Skills — Angular, TypeScript, .NET, Node.js, AWS',
    loadComponent: () => import('./pages/skills/skills').then((m) => m.Skills),
  },
  {
    path: 'certifications',
    title: `Certifications — ${SITE}`,
    loadComponent: () => import('./pages/certifications/certifications').then((m) => m.Certifications),
  },
  {
    path: 'writing',
    title: `Writing — ${SITE}`,
    loadComponent: () => import('./pages/writing/writing').then((m) => m.Writing),
  },
  {
    path: 'contact',
    title: `Contact — ${SITE}`,
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    // Prerendered and copied to /404.html by scripts/postbuild.mjs (see docs pages/not-found.md).
    path: '404',
    title: `Not found — ${SITE}`,
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: '**',
    title: `Not found — ${SITE}`,
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
