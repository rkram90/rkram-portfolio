import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { Content } from '../../core/services/content';
import { Button } from '../../shared/button/button';
import { Chip } from '../../shared/chip/chip';
import { Section } from '../../shared/section/section';

const HOW_I_WORK = [
  'Lead distributed onshore/offshore teams from requirements to release.',
  'Guard code quality with reviews, tests and SonarQube gates.',
  'Build accessible by default — semantic HTML, keyboard and screen-reader checks.',
  'Own production: observability, root-cause analysis and fixes that stick.',
];

const LEARNING = ['AI-assisted engineering (Claude)', '.NET 9', 'Angular signals & zoneless'];

@Component({
  selector: 'app-about',
  imports: [RouterLink, Button, Chip, Section],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly content = inject(Content);
  protected readonly profile = this.content.profile();
  protected readonly howIWork = HOW_I_WORK;
  protected readonly learning = LEARNING;

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content: 'From PHP developer to Angular Technology Lead: how I grew, how I lead teams, and what I want next.',
    });
  }
}
