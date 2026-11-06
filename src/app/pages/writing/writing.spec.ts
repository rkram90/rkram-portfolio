import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Writing } from './writing';

describe('Writing', () => {
  let fixture: ComponentFixture<Writing>;
  let el: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Writing);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('shows 6 featured posts newest first, the series in reading order, and more posts', () => {
    const featured = Array.from(el.querySelectorAll('.cards h3')).map((h) => h.textContent);
    expect(featured.length).toBe(6);
    expect(featured[0]).toContain('CSS Grid');
    const series = el.querySelectorAll('.series-list li');
    expect(series.length).toBe(13);
    expect(series[0].textContent).toContain('What is React?');
    expect(el.querySelector('.series')?.textContent).toContain('Aug 2023 – Oct 2023');
    expect(el.querySelectorAll('.more li').length).toBe(7);
  });

  it('opens every external link in a new tab with noopener and a hidden hint', () => {
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('a[href^="https://"]'));
    expect(links.length).toBeGreaterThan(20);
    for (const a of links) {
      expect(a.target).toBe('_blank');
      expect(a.rel).toBe('noopener');
      expect(a.querySelector('.visually-hidden')?.textContent).toContain('opens in new tab');
    }
  });

  it('formats dates as month and year', () => {
    expect(fixture.componentInstance.month('2019-11')).toBe('Nov 2019');
  });
});
