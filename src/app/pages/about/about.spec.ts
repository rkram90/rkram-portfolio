import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { Content } from '../../core/services/content';
import { About } from './about';

describe('About', () => {
  let fixture: ComponentFixture<About>;
  let el: HTMLElement;
  const profile = () => TestBed.inject(Content).profile();

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(About);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('has a single h1 and a portrait with alt text', () => {
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('img')?.getAttribute('alt')).toBe(`Portrait of ${profile().name}`);
  });

  it('renders the narrative, open-to chips and beyond-work lines from data', () => {
    expect(el.querySelectorAll('.story').length).toBe(profile().about.length);
    expect(Array.from(el.querySelectorAll('.open-to app-chip')).map((c) => c.textContent)).toEqual(profile().openTo);
    const beyond = Array.from(el.querySelectorAll('.beyond li')).map((li) => li.textContent?.trim());
    expect(beyond).toEqual(profile().beyondWork);
    expect(el.querySelector('.beyond svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('links the résumé and contact', () => {
    expect(el.querySelector('a[download]')?.getAttribute('href')).toBe('/resume.pdf');
    expect(el.querySelector('a[href="/contact"]')).not.toBeNull();
  });

  it('stays under 400 words', () => {
    expect(el.textContent!.trim().split(/\s+/).length).toBeLessThanOrEqual(400);
  });

  it('sets the meta description', () => {
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toContain('Technology Lead');
  });
});
