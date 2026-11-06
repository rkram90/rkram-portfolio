// Site content, so assertions follow the JSON instead of hard-coded copy (docs 08 §2).
import credentials from '../src/app/data/credentials.json';
import experience from '../src/app/data/experience.json';
import profile from '../src/app/data/profile.json';
import projects from '../src/app/data/projects.json';
import skills from '../src/app/data/skills.json';
import writing from '../src/app/data/writing.json';

export { credentials, experience, profile, projects, skills, writing };

export const SITE = 'Ramkumar Karuppaiah';

export const projectsByOrder = [...projects].sort((a, b) => a.order - b.order);

/** Every prerendered route with its expected h1 and <title>. Keep in sync with app.routes.ts. */
export const ROUTES = [
  { path: '/', h1: profile.name, title: `${SITE} — Technology Lead & Angular Specialist` },
  { path: '/about', h1: 'About', title: `About — ${SITE}` },
  { path: '/experience', h1: 'Experience', title: `Experience — ${SITE}` },
  { path: '/projects', h1: 'Projects', title: `Projects — ${SITE}` },
  { path: `/projects/${projectsByOrder[0].slug}`, h1: projectsByOrder[0].title, title: `${projectsByOrder[0].title} — Case Study` },
  { path: '/skills', h1: 'Skills', title: 'Skills — Angular, TypeScript, .NET, Node.js, AWS' },
  { path: '/certifications', h1: 'Certifications & Education', title: `Certifications — ${SITE}` },
  { path: '/writing', h1: 'Writing', title: `Writing — ${SITE}` },
  { path: '/contact', h1: 'Contact', title: `Contact — ${SITE}` },
] as const;
