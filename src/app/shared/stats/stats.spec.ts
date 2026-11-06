import { TestBed } from '@angular/core/testing';

import { Stats } from './stats';

describe('Stats', () => {
  it('renders each stat as a dt/dd pair', async () => {
    const fixture = TestBed.createComponent(Stats);
    fixture.componentRef.setInput('stats', [
      { value: '13+', label: 'Years in web engineering' },
      { value: '4', label: 'Enterprise clients' },
    ]);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(Array.from(el.querySelectorAll('dt')).map((d) => d.textContent)).toEqual([
      'Years in web engineering',
      'Enterprise clients',
    ]);
    expect(Array.from(el.querySelectorAll('dd')).map((d) => d.textContent)).toEqual(['13+', '4']);
  });
});
