import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Content } from '../../core/services/content';
import { Certifications } from './certifications';

describe('Certifications', () => {
  let fixture: ComponentFixture<Certifications>;
  let el: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Certifications);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('renders certification cards, separate courses, education and training from data', () => {
    const c = TestBed.inject(Content).credentials();
    expect(el.querySelectorAll('.cards .card').length).toBe(c.certifications.length);
    expect(el.querySelector('#courses')?.parentElement?.textContent).toContain('Claude Certified Architect Foundations — Udemy');
    expect(el.querySelector('#education')?.parentElement?.textContent).toContain(
      'Bachelor of Engineering, Computer Science and Engineering',
    );
    expect(el.querySelectorAll('app-chip').length).toBe(c.training.length);
  });

  it('omits training durations', () => {
    expect(el.textContent).not.toMatch(/\bdays?\b/);
  });
});
