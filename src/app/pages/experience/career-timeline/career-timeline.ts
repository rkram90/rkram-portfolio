import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import type { Employer } from '../../../core/models/content.schema';
import { Chip } from '../../../shared/chip/chip';
import { DurationPipe } from '../../../shared/pipes/duration-pipe';
import { YmRangePipe } from '../../../shared/pipes/ym-range-pipe';
import { scrollProgress } from '../timeline-math';

/** The marker starts moving when the timeline top reaches this fraction of the viewport height. */
const ANCHOR = 0.4;

@Component({
  selector: 'app-career-timeline',
  imports: [NgOptimizedImage, Chip, YmRangePipe, DurationPipe],
  templateUrl: './career-timeline.html',
  styleUrl: './career-timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--marker-y]': 'markerY() + "px"' },
})
export class CareerTimeline {
  readonly employers = input.required<Employer[]>();

  protected readonly markerY = signal(0);

  private readonly list = viewChild.required<ElementRef<HTMLOListElement>>('list');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      let frame = 0;
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(() => ((frame = 0), this.update()));
      };
      const opts = { passive: true };
      window.addEventListener('scroll', schedule, opts);
      window.addEventListener('resize', schedule, opts);
      this.update();

      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
      });
    });
  }

  /** Moves the marker along the track in step with scroll progress. */
  update(): void {
    const rect = this.list().nativeElement.getBoundingClientRect();
    const doc = document.documentElement;
    const remaining = doc.scrollHeight - window.innerHeight - window.scrollY;
    this.markerY.set(scrollProgress(rect.top, window.innerHeight * ANCHOR, Math.max(remaining, 0)) * rect.height);
  }
}
