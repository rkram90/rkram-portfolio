export interface NavLink {
  path: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { path: '/about', label: 'About' },
  { path: '/experience', label: 'Experience' },
  { path: '/projects', label: 'Projects' },
  { path: '/skills', label: 'Skills' },
  { path: '/certifications', label: 'Certifications' },
  { path: '/writing', label: 'Writing' },
  { path: '/contact', label: 'Contact' },
];
