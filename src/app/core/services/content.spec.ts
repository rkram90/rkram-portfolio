import { TestBed } from '@angular/core/testing';

import { Content } from './content';

describe('Content', () => {
  let content: Content;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 1));
    content = TestBed.inject(Content);
  });

  afterEach(() => vi.useRealTimers());

  it('lists employers newest first', () => {
    const starts = content.employers().map((e) => e.start);
    expect(starts).toEqual(starts.toSorted().reverse());
  });

  it('computes years from the profile dates', () => {
    expect(content.yearsExperience()).toBe(13);
    expect(content.yearsAngular()).toBe(8);
  });

  it('resolves stat and summary tokens', () => {
    expect(content.stats().map((s) => s.value)).toEqual(['13+', '8+', '4']);
    expect(content.summary()).toContain('13 years');
    expect(content.summary()).not.toContain('{');
  });

  it('sorts projects and exposes the featured ones', () => {
    const orders = content.projects().map((p) => p.order);
    expect(orders).toEqual(orders.toSorted((a, b) => a - b));
    expect(content.featured().length).toBe(3);
  });

  it('lists core skills', () => {
    expect(content.coreSkills()).toEqual(['Angular', 'TypeScript', 'RxJS', '.NET', 'Node.js', 'AWS']);
  });
});
