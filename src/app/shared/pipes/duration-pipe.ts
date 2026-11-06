import { Pipe, PipeTransform } from '@angular/core';

import { monthsBetween } from '../../pages/experience/timeline-math';

/** `"2024-05" | duration: "2025-06"` → "1 yr 2 mos" (inclusive months; `null` end = today). */
@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(start: string, end: string | null, now = new Date()): string {
    const total = monthsBetween(start, end, now);
    const years = Math.floor(total / 12);
    const months = total % 12;
    const parts = [];
    if (years) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
    if (months || !years) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
    return parts.join(' ');
  }
}
