import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { Content } from '../../core/services/content';
import { Chip } from '../../shared/chip/chip';

@Component({
  selector: 'app-skills',
  imports: [NgTemplateOutlet, RouterLink, Chip],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  private readonly content = inject(Content);

  /** Groups with core skills first; `linked` when a project uses the skill (chip → filtered /projects). */
  readonly groups = computed(() => {
    const used = new Set(this.content.allTech());
    return this.content.skills().map((g) => ({
      ...g,
      skills: g.skills
        .toSorted((a, b) => Number(!!b.core) - Number(!!a.core))
        .map((s) => ({ ...s, linked: used.has(s.name) })),
    }));
  });

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content: 'Skills: Angular, TypeScript, RxJS, .NET, Node.js and AWS, plus testing, observability and cloud tooling.',
    });
  }
}
