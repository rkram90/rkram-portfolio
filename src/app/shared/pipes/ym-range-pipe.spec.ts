import { YmRangePipe } from './ym-range-pipe';

describe('YmRangePipe', () => {
  const pipe = new YmRangePipe();

  it('formats month ranges', () => {
    expect(pipe.transform('2024-05', '2025-04')).toBe('May 2024 – Apr 2025');
  });

  it('shows Present for open ranges', () => {
    expect(pipe.transform('2025-05', null)).toBe('May 2025 – Present');
  });

  it('formats years only', () => {
    expect(pipe.transform('2022-01', null, { yearsOnly: true })).toBe('2022 – Present');
    expect(pipe.transform('2013-01', '2014-03', { yearsOnly: true })).toBe('2013 – 2014');
  });
});
