import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Tech tag: `<app-chip version="19">Angular</app-chip>` → "Angular 19" (version muted). */
@Component({
  selector: 'app-chip',
  imports: [],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chip {
  readonly version = input<string>();
}
