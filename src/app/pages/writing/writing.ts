import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { Content } from '../../core/services/content';
import { Chip } from '../../shared/chip/chip';
import { Section } from '../../shared/section/section';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REACT_CATEGORY = 'https://rkramblog.wordpress.com/category/reactjs/';

/** Curated links to the WordPress blog; posts are not migrated (see docs pages/writing.md). */
@Component({
  selector: 'app-writing',
  imports: [Chip, Section],
  templateUrl: './writing.html',
  styleUrl: './writing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Writing {
  private readonly content = inject(Content);
  protected readonly blog = this.content.profile().links.blog;
  protected readonly reactCategory = REACT_CATEGORY;

  readonly featured = this.content.featuredPosts;
  readonly series = computed(() => this.content.posts().filter((p) => p.series === 'react-fundamentals').toSorted((a, b) => a.date.localeCompare(b.date)));
  readonly more = computed(() => this.content.posts().filter((p) => p.tier === 'more'));
  readonly seriesRange = computed(() => {
    const s = this.series();
    return s.length ? `${this.month(s[0].date)} – ${this.month(s[s.length - 1].date)}` : '';
  });

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content: 'Notes from learning and teaching — Angular, RxJS, React and CSS posts by Ramkumar Karuppaiah.',
    });
  }

  /** "2023-10" → "Oct 2023". */
  month(ym: string): string {
    const [y, m] = ym.split('-');
    return `${MONTHS[Number(m) - 1]} ${y}`;
  }
}
