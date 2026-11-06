import credentials from '../../data/credentials.json';
import experience from '../../data/experience.json';
import profile from '../../data/profile.json';
import projects from '../../data/projects.json';
import skills from '../../data/skills.json';
import writing from '../../data/writing.json';
import {
  CredentialsSchema,
  EmployerSchema,
  PostSchema,
  ProfileSchema,
  ProjectSchema,
  SkillGroupSchema,
} from './content.schema';

interface Period {
  start: string;
  end: string | null;
}

const employers = EmployerSchema.array().parse(experience);
const projectList = ProjectSchema.array().parse(projects);
const endOf = (p: Period) => p.end ?? '9999-12';
const within = (inner: Period, outer: Period) => inner.start >= outer.start && endOf(inner) <= endOf(outer);

// `TODO:` placeholders only fail CI on main (see docs 03); elsewhere they are listed as a warning.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
const strictTodos = !!env['CI'] && env['GITHUB_REF'] === 'refs/heads/main';

describe('content data', () => {
  it('matches the schemas', () => {
    expect(() => ProfileSchema.parse(profile)).not.toThrow();
    expect(() => SkillGroupSchema.array().parse(skills)).not.toThrow();
    expect(() => CredentialsSchema.parse(credentials)).not.toThrow();
    expect(() => PostSchema.array().parse(writing)).not.toThrow();
    expect(employers.length).toBeGreaterThan(0);
    expect(projectList.length).toBeGreaterThan(0);
  });

  it('has start ≤ end everywhere', () => {
    const periods = [
      ...projectList,
      ...employers.flatMap((e) => [e, ...e.titles, ...(e.engagements ?? []).flatMap((g) => [g, ...g.roles])]),
    ];
    for (const p of periods) expect(p.start <= endOf(p), JSON.stringify(p)).toBe(true);
  });

  it('keeps engagements and roles inside their parent dates', () => {
    for (const e of employers) {
      for (const g of e.engagements ?? []) {
        expect(within(g, e), g.id).toBe(true);
        for (const r of g.roles) expect(within(r, g), `${g.id}: ${r.title}`).toBe(true);
      }
    }
  });

  it('has unique ids and slugs', () => {
    const ids = employers.flatMap((e) => [e.id, ...(e.engagements ?? []).map((g) => g.id)]);
    expect(new Set(ids).size).toBe(ids.length);
    const slugs = projectList.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('links engagements only to existing projects', () => {
    const slugs = new Set(projectList.map((p) => p.slug));
    for (const g of employers.flatMap((e) => e.engagements ?? [])) {
      if (g.projectSlug) expect(slugs.has(g.projectSlug), g.projectSlug).toBe(true);
    }
  });

  it('features exactly 3 projects', () => {
    expect(projectList.filter((p) => p.featured).length).toBe(3);
  });

  it('lists only blog study posts, with unique URLs and series names on series posts', () => {
    const posts = PostSchema.array().parse(writing);
    expect(new Set(posts.map((p) => p.url)).size).toBe(posts.length);
    for (const p of posts) {
      expect(p.url.startsWith('https://rkramblog.wordpress.com/'), p.url).toBe(true);
      expect(p.tier === 'series', p.title).toBe(!!p.series);
    }
    // Personal posts stay off the portfolio (see docs pages/writing.md).
    expect(JSON.stringify(posts)).not.toMatch(/friend|family|nephew|niece|mapula/i);
  });

  it('has no TODO placeholders on main', () => {
    const todos = Object.entries({ credentials, experience, profile, projects, skills, writing }).flatMap(([file, data]) =>
      (JSON.stringify(data).match(/TODO:[^"]*/g) ?? []).map((t) => `${file}: ${t}`),
    );
    if (strictTodos) expect(todos).toEqual([]);
    else if (todos.length) console.warn(`${todos.length} TODO placeholders:\n${todos.join('\n')}`);
  });
});
