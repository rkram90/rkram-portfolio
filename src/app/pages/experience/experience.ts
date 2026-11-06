import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Content } from '../../core/services/content';
import { CareerTimeline } from './career-timeline/career-timeline';

@Component({
  selector: 'app-experience',
  imports: [CareerTimeline],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {
  protected readonly content = inject(Content);
}
