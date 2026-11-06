import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Stats strip as one `<dl>`: big amber value, muted label. */
@Component({
  selector: 'app-stats',
  imports: [],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stats {
  readonly stats = input.required<{ value: string; label: string }[]>();
}
