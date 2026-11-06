import { Pipe, PipeTransform } from '@angular/core';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `"2024-05" | ymRange: "2025-04"` → "May 2024 – Apr 2025"; `null` end → "Present". */
@Pipe({
  name: 'ymRange',
})
export class YmRangePipe implements PipeTransform {
  transform(start: string, end: string | null, options: { yearsOnly?: boolean } = {}): string {
    const fmt = (ym: string) => {
      const [y, m] = ym.split('-');
      return options.yearsOnly ? y : `${MONTHS[Number(m) - 1]} ${y}`;
    };
    return `${fmt(start)} – ${end === null ? 'Present' : fmt(end)}`;
  }
}
