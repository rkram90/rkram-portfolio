import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Project } from '../../core/models/content.schema';
import { Chip } from '../chip/chip';

/** Project summary card; the title link is stretched so the whole card is clickable. */
@Component({
  selector: 'app-project-card',
  imports: [RouterLink, Chip],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
