import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { Content } from '../../core/services/content';
import { Chip } from '../../shared/chip/chip';
import { Section } from '../../shared/section/section';

@Component({
  selector: 'app-certifications',
  imports: [Chip, Section],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Certifications {
  protected readonly credentials = inject(Content).credentials();

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content: 'Certifications, courses, education and training: Angular, front-end, Adobe Experience Manager, agile and AWS.',
    });
  }

  /** "Udemy, 2024"; skips missing parts. */
  protected meta(...parts: (string | number | undefined)[]): string {
    return parts.filter((p) => p !== undefined && p !== '').join(', ');
  }
}
