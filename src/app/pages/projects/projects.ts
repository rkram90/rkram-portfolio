import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import type { Project } from '../../core/models/content.schema';
import { Content } from '../../core/services/content';
import { Chip } from '../../shared/chip/chip';
import { ProjectCard } from '../../shared/project-card/project-card';

type TypeFilter = 'all' | Project['type'];
const TYPES: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'client', label: 'Client' },
  { value: 'personal', label: 'Personal' },
];

@Component({
  selector: 'app-projects',
  imports: [Chip, ProjectCard],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly content = inject(Content);
  protected readonly types = TYPES;

  // Filters start from the URL (?type=client&tech=Angular,AWS) so views are shareable.
  private readonly params = this.route.snapshot.queryParamMap;
  readonly type = signal<TypeFilter>(this.parseType(this.params.get('type')));
  readonly selectedTech = signal<ReadonlySet<string>>(
    new Set((this.params.get('tech') ?? '').split(',').filter((t) => this.content.allTech().includes(t))),
  );

  readonly visible = computed(() =>
    this.content
      .projects()
      .filter((p) => (this.type() === 'all' || p.type === this.type()) && [...this.selectedTech()].every((t) => (p.tech as readonly string[]).includes(t))),
  );
  readonly filtered = computed(() => this.type() !== 'all' || this.selectedTech().size > 0);

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content: 'Case studies: enterprise Angular front ends for airlines and telecoms — problems, technical decisions and outcomes.',
    });
  }

  setType(value: TypeFilter): void {
    this.type.set(value);
    this.syncUrl();
  }

  toggleTech(tech: string): void {
    this.selectedTech.update((s) => {
      const next = new Set(s);
      if (!next.delete(tech)) next.add(tech);
      return next;
    });
    this.syncUrl();
  }

  clear(): void {
    this.type.set('all');
    this.selectedTech.set(new Set());
    this.syncUrl();
  }

  private parseType(v: string | null): TypeFilter {
    return TYPES.some((t) => t.value === v) ? (v as TypeFilter) : 'all';
  }

  private syncUrl(): void {
    const tech = [...this.selectedTech()].join(',');
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: this.type() === 'all' ? null : this.type(), tech: tech || null },
      replaceUrl: true,
    });
  }
}
