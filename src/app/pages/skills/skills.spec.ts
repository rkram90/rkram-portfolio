import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Content } from '../../core/services/content';
import { Skills } from './skills';

describe('Skills', () => {
  let fixture: ComponentFixture<Skills>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(Skills);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('renders one section with an h2 per group, every skill from data', () => {
    const groups = TestBed.inject(Content).skills();
    expect(Array.from(el.querySelectorAll('section h2')).map((h) => h.textContent)).toEqual(groups.map((g) => g.label));
    expect(el.querySelectorAll('app-chip').length).toBe(groups.flatMap((g) => g.skills).length);
  });

  it('puts core skills first with a labelled star and years suffix', () => {
    const first = el.querySelector('section .chips li')!;
    expect(first.classList).toContain('core');
    expect(first.querySelector('[aria-label="core skill"]')?.textContent).toBe('★');
    expect(first.textContent).toContain('Angular');
    expect(first.textContent).toContain('· 8y');
  });

  it('links skills used by projects to the filtered projects list', () => {
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.chips a')).map((a) => a.getAttribute('href'));
    expect(links).toContain('/projects?tech=DuckDB');
    // Not used by any project, so plain text.
    expect(links).not.toContain('/projects?tech=MongoDB');
  });

  it('shows no proficiency labels or percentages', () => {
    expect(el.textContent).not.toMatch(/%|expert|competent|beginner/i);
  });
});
