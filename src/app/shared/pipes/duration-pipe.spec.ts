import { DurationPipe } from './duration-pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('formats years and months', () => {
    expect(pipe.transform('2016-01', '2017-11')).toBe('1 yr 11 mos');
    expect(pipe.transform('2024-05', '2025-04')).toBe('1 yr');
    expect(pipe.transform('2013-01', '2014-03')).toBe('1 yr 3 mos');
    expect(pipe.transform('2024-01', '2025-12')).toBe('2 yrs');
  });

  it('handles short and open ranges', () => {
    expect(pipe.transform('2020-01', '2020-01')).toBe('1 mo');
    expect(pipe.transform('2019-11', '2020-02')).toBe('4 mos');
    expect(pipe.transform('2018-02', null, new Date(2026, 10, 1))).toBe('8 yrs 10 mos');
  });
});
