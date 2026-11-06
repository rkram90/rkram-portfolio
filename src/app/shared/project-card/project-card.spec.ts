import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { Project } from '../../core/models/content.schema';
import { ProjectCard } from './project-card';

const PROJECT: Project = {
  slug: 'fare-automation',
  title: 'Fare Automation Platform',
  type: 'client',
  client: 'A major US airline',
  role: 'Technology Lead',
  start: '2024-05',
  end: '2025-04',
  tagline: 'Event-driven fare calculation.',
  problem: 'Slow',
  approach: ['Built it'],
  outcomes: [{ text: 'Faster' }],
  tech: ['Angular', 'AWS'],
  versions: { Angular: '16' },
  featured: true,
  order: 2,
};

describe('ProjectCard', () => {
  async function render(project: Project) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ProjectCard);
    fixture.componentRef.setInput('project', project);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('links the title to the case study and shows tech with versions', async () => {
    const el = await render(PROJECT);
    const link = el.querySelector('h3 a')!;
    expect(link.getAttribute('href')).toBe('/projects/fare-automation');
    expect(link.textContent).toBe('Fare Automation Platform');
    expect(el.querySelector('.client')?.textContent).toBe('A major US airline');
    expect(Array.from(el.querySelectorAll('app-chip')).map((c) => c.textContent)).toEqual(['Angular 16', 'AWS']);
  });

  it('omits the client line for personal projects', async () => {
    const el = await render({ ...PROJECT, type: 'personal', client: undefined });
    expect(el.querySelector('.client')).toBeNull();
  });
});
