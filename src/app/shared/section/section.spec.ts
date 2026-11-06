import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Section } from './section';

@Component({
  imports: [Section],
  template: `
    <app-section heading="Core stack" headingId="core" eyebrow="Tools"><p>Body</p></app-section>
    <app-section heading="Plain" headingId="plain" />
  `,
})
class Host {}

describe('Section', () => {
  it('labels the section with its h2 and projects content', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [first, second] = fixture.nativeElement.querySelectorAll('section');

    expect(first.getAttribute('aria-labelledby')).toBe('core');
    expect(first.querySelector('h2#core').textContent).toBe('Core stack');
    expect(first.querySelector('.eyebrow').textContent).toBe('Tools');
    expect(first.querySelector('p:last-child').textContent).toBe('Body');
    expect(second.querySelector('.eyebrow')).toBeNull();
  });
});
