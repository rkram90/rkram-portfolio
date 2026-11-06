import { clampOffset, monthsBetween, scrollProgress, ymToDecimal } from './timeline-math';

const NOW = new Date(2026, 10, 1); // Nov 2026

describe('timeline-math', () => {
  it('clamps offsets to [0, max]', () => {
    expect(clampOffset(-5, 100)).toBe(0);
    expect(clampOffset(50, 100)).toBe(50);
    expect(clampOffset(150, 100)).toBe(100);
    expect(clampOffset(10, -1)).toBe(0);
  });

  it('converts YYYY-MM and null to decimal years', () => {
    expect(ymToDecimal('2021-07')).toBe(2021.5);
    expect(ymToDecimal(null, NOW)).toBeCloseTo(2026 + 10 / 12);
  });

  it('maps scroll position to progress, reaching 1 at the end of the page', () => {
    expect(scrollProgress(600, 400, 2000)).toBe(0); // timeline still below the anchor
    expect(scrollProgress(400, 400, 1000)).toBe(0);
    expect(scrollProgress(-100, 400, 500)).toBe(0.5);
    expect(scrollProgress(-600, 400, 0)).toBe(1); // bottom of the page
    expect(scrollProgress(500, 400, 0)).toBe(1); // nothing to scroll
  });

  it('counts months inclusively', () => {
    expect(monthsBetween('2024-05', '2025-04')).toBe(12);
    expect(monthsBetween('2025-05', null, NOW)).toBe(19);
  });
});
