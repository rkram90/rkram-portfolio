import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

import { Content } from '../../core/services/content';
import { Chip } from '../../shared/chip/chip';
import { YmRangePipe } from '../../shared/pipes/ym-range-pipe';
import { Stats } from '../../shared/stats/stats';

/** Case study at /projects/:slug; every slug is prerendered (see app.routes.server.ts). */
@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, Chip, Stats, YmRangePipe],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetail {
  private readonly content = inject(Content);

  /** Bound from the route param via withComponentInputBinding(). */
  readonly slug = input.required<string>();

  private readonly index = computed(() => this.content.projects().findIndex((p) => p.slug === this.slug()));
  readonly project = computed(() => this.content.projects()[this.index()]);
  readonly prev = computed(() => this.content.projects()[this.index() - 1]);
  readonly next = computed(() => this.content.projects()[this.index() + 1]);

  readonly metrics = computed(() =>
    (this.project()?.outcomes ?? []).flatMap((o) => (o.metric ? [{ value: o.metric, label: o.text }] : [])),
  );
  readonly notes = computed(() => (this.project()?.outcomes ?? []).filter((o) => !o.metric));

  constructor() {
    const router = inject(Router);
    const title = inject(Title);
    const meta = inject(Meta);
    effect(() => {
      const p = this.project();
      if (!p) {
        void router.navigate(['/404'], { skipLocationChange: true });
        return;
      }
      title.setTitle(`${p.title} — Case Study`);
      meta.updateTag({ name: 'description', content: p.tagline });
    });
  }
}
