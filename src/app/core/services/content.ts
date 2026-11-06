import { Injectable, computed, signal } from '@angular/core';

import credentialsJson from '../../data/credentials.json';
import experienceJson from '../../data/experience.json';
import profileJson from '../../data/profile.json';
import projectsJson from '../../data/projects.json';
import skillsJson from '../../data/skills.json';
import writingJson from '../../data/writing.json';
import type { Credentials, Employer, Post, Profile, Project, SkillGroup } from '../models/content.schema';

/** Whole years from a `YYYY-MM` start until today. */
function yearsSince(ym: string): number {
  const [y, m] = ym.split('-').map(Number);
  const now = new Date();
  return Math.floor((now.getFullYear() * 12 + now.getMonth() - (y * 12 + m - 1)) / 12);
}

/** Read-only content signals. Validation happens in the schema spec, not at runtime. */
@Injectable({
  providedIn: 'root',
})
export class Content {
  readonly profile = signal(profileJson as Profile).asReadonly();
  readonly employers = signal(experienceJson as Employer[]).asReadonly();
  readonly projects = signal((projectsJson as Project[]).toSorted((a, b) => a.order - b.order)).asReadonly();
  readonly skills = signal(skillsJson as SkillGroup[]).asReadonly();
  readonly credentials = signal(credentialsJson as Credentials).asReadonly();
  /** Newest first. */
  readonly posts = signal((writingJson as Post[]).toSorted((a, b) => b.date.localeCompare(a.date))).asReadonly();
  readonly featuredPosts = computed(() => this.posts().filter((p) => p.tier === 'featured'));

  readonly featured = computed(() => this.projects().filter((p) => p.featured));
  /** Distinct tech across projects, most used first (filter chips). */
  readonly allTech = computed(() => {
    const counts = new Map<string, number>();
    for (const t of this.projects().flatMap((p) => p.tech)) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.keys()].toSorted((a, b) => counts.get(b)! - counts.get(a)! || a.localeCompare(b));
  });
  readonly coreSkills = computed(() =>
    this.skills().flatMap((g) => g.skills.filter((s) => s.core).map((s) => s.name)),
  );
  readonly yearsExperience = computed(() => yearsSince(this.profile().careerStart));
  readonly yearsAngular = computed(() => yearsSince(this.profile().angularStart));
  readonly clientCount = computed(
    () => new Set(this.employers().flatMap((e) => e.engagements ?? []).map((g) => g.client)).size,
  );

  readonly summary = computed(() => this.resolve(this.profile().summary));
  readonly stats = computed(() => this.profile().stats.map((s) => ({ ...s, value: this.resolve(s.value) })));

  /** Replaces derived-number tokens (see docs 03). */
  private resolve(text: string): string {
    return text
      .replace('{years}', `${this.yearsExperience()}`)
      .replace('{angularYears}', `${this.yearsAngular()}`)
      .replace('{clients}', `${this.clientCount()}`);
  }
}
