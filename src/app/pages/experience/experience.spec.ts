import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Content } from '../../core/services/content';
import { Experience } from './experience';

describe('Experience', () => {
  let fixture: ComponentFixture<Experience>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Experience);
    await fixture.whenStable();
  });

  it('renders every employer and engagement from the data', () => {
    const el: HTMLElement = fixture.nativeElement;
    const employers = TestBed.inject(Content).employers();
    expect(el.querySelectorAll('li.row').length).toBe(employers.length);
    expect(el.querySelectorAll('details').length).toBe(employers.flatMap((e) => e.engagements ?? []).length);
    expect(el.querySelector('.lead')?.textContent).toMatch(/\d+ years/);
  });
});
