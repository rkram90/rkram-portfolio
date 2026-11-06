// zod schemas — the only source of content types (see docs 03).
// App code must use `import type` so zod stays out of the production bundle.
import { z } from 'zod';

import { TECH } from './tech';

export const YearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const Tech = z.enum(TECH);
const Period = z.object({ title: z.string(), start: YearMonth, end: YearMonth.nullable() });

export const ProfileSchema = z.object({
  name: z.string(),
  headline: z.string(),
  summary: z.string().max(155), // meta description; may contain {years} {angularYears} tokens
  about: z.array(z.string()).min(1).max(4), // About-page narrative paragraphs
  location: z.string(),
  openTo: z.array(z.string()),
  beyondWork: z.array(z.string()).length(2), // About-page personal blurb (two lines)
  careerStart: YearMonth,
  angularStart: YearMonth, // for the "Years with Angular" stat
  email: z.email(),
  links: z.object({
    linkedin: z.url(),
    github: z.url(),
    blog: z.url().optional(),
    resumePdf: z.string().optional(), // résumé button is hidden until set
  }),
  // value may contain tokens: {years} {angularYears} {clients} — resolved by Content
  stats: z.array(z.object({ value: z.string(), label: z.string() })).length(3),
});

// Engagements sit directly under the employer; one engagement can span several titles (promotions).
export const EngagementSchema = z.object({
  id: z.string(),
  name: z.string(),
  client: z.string(), // anonymized descriptor only
  roles: z.array(Period).min(1),
  start: YearMonth,
  end: YearMonth.nullable(),
  summary: z.string(),
  highlights: z.array(z.string()),
  tech: z.array(Tech),
  versions: z.partialRecord(Tech, z.string()).optional(), // { "Angular": "11 → 14" }
  projectSlug: z.string().optional(),
});

export const EmployerSchema = z.object({
  id: z.string(),
  company: z.string(),
  location: z.string(),
  start: YearMonth,
  end: YearMonth.nullable(),
  titles: z.array(Period).min(1),
  highlights: z.array(z.string()).optional(), // employers without engagements
  engagements: z.array(EngagementSchema).optional(),
});

export const ProjectSchema = z.object({
  slug: z.string(),
  title: z.string(),
  type: z.enum(['client', 'personal']),
  client: z.string().optional(),
  role: z.string(),
  start: YearMonth,
  end: YearMonth.nullable(),
  tagline: z.string().max(120),
  problem: z.string(),
  approach: z.array(z.string()).min(1),
  outcomes: z.array(z.object({ metric: z.string().optional(), text: z.string() })).min(1),
  tech: z.array(Tech),
  versions: z.partialRecord(Tech, z.string()).optional(),
  links: z.object({ demo: z.url().optional(), repo: z.url().optional() }).optional(),
  cover: z.string().optional(), // /images/projects/<slug>.webp
  featured: z.boolean(),
  order: z.number().int(),
});

export const SkillGroupSchema = z.object({
  id: z.enum(['frontend', 'backend', 'cloud-devops', 'data', 'quality', 'observability', 'platforms']),
  label: z.string(),
  skills: z
    .array(z.object({ name: z.string(), years: z.number().optional(), core: z.boolean().optional() }))
    .max(10),
});

export const CredentialsSchema = z.object({
  certifications: z.array(
    z.object({ name: z.string(), issuer: z.string(), year: z.number().int().optional(), url: z.url().optional() }),
  ),
  courses: z.array(
    z.object({ name: z.string(), provider: z.string(), year: z.number().int().optional(), url: z.url().optional() }),
  ),
  education: z.array(
    z.object({ degree: z.string(), field: z.string(), institution: z.string().optional(), year: z.number().int() }),
  ),
  training: z.array(z.object({ topic: z.string(), days: z.number().optional() })),
});

export const PostSchema = z.object({
  title: z.string(),
  url: z.url(), // external WordPress URL (see docs pages/writing.md)
  date: YearMonth,
  tags: z.array(Tech),
  summary: z.string().optional(),
  tier: z.enum(['featured', 'series', 'more']),
  series: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Engagement = z.infer<typeof EngagementSchema>;
export type Employer = z.infer<typeof EmployerSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type Credentials = z.infer<typeof CredentialsSchema>;
export type Post = z.infer<typeof PostSchema>;
