import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';

import { ProjectDetail } from './project-detail';

describe('ProjectDetail', () => {
  let fixture: ComponentFixture<ProjectDetail>;
  let el: HTMLElement;

  async function render(slug: string) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(ProjectDetail);
    fixture.componentRef.setInput('slug', slug);
    el = fixture.nativeElement;
    await fixture.whenStable();
  }

  it('renders the case study with metric stats and note bullets', async () => {
    await render('fare-automation');
    expect(el.querySelector('h1')?.textContent).toBe('Fare Automation Platform');
    expect(el.querySelector('.meta')?.textContent).toContain('May 2024 – Apr 2025');
    expect(el.querySelector('app-stats dd')?.textContent).toBe('90%');
    expect(el.querySelector('#outcomes + app-stats + ul li')?.textContent).toContain('SignalR');
    expect(el.textContent).toContain('Angular 16');
    expect(TestBed.inject(Title).getTitle()).toBe('Fare Automation Platform — Case Study');
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toContain('fare calculation');
  });

  it('links to previous and next projects, and hides links for client work', async () => {
    await render('fare-automation');
    expect(el.querySelector('a[rel="prev"]')?.getAttribute('href')).toBe('/projects/reservations-platform');
    expect(el.querySelector('a[rel="next"]')?.getAttribute('href')).toBe('/projects/telecom-microfrontends');
    expect(el.querySelector('#links')).toBeNull();
  });

  it('has no previous link on the first project', async () => {
    await render('reservations-platform');
    expect(el.querySelector('a[rel="prev"]')).toBeNull();
  });

  it('redirects unknown slugs to /404 without changing the URL', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(ProjectDetail);
    fixture.componentRef.setInput('slug', 'nope');
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith(['/404'], { skipLocationChange: true });
    expect(fixture.nativeElement.querySelector('h1')).toBeNull();
  });
});
