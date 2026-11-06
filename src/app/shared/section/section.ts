import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Page section with optional eyebrow and an h2 that labels it. */
@Component({
  selector: 'app-section',
  imports: [],
  templateUrl: './section.html',
  styleUrl: './section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Section {
  readonly heading = input.required<string>();
  /** Used for the h2 id and `aria-labelledby`; must be unique on the page. */
  readonly headingId = input.required<string>();
  readonly eyebrow = input<string>();
}
