import { DOCUMENT } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { Content } from '../../core/services/content';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let el: HTMLElement;

  const jsonLd = () => TestBed.inject(DOCUMENT).head.querySelector('script[type="application/ld+json"]');

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(Home);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('has a single h1 with the name', () => {
    const h1s = el.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toBe('Ramkumar Karuppaiah');
  });

  it('renders featured projects and stats from data', () => {
    const content = TestBed.inject(Content);
    const titles = Array.from(el.querySelectorAll('app-project-card h3')).map((h) => h.textContent?.trim());
    expect(titles).toEqual(content.featured().map((p) => p.title));
    expect(el.querySelectorAll('app-stats dl > div').length).toBe(3);
    expect(Array.from(el.querySelectorAll('.stack app-chip')).map((c) => c.textContent)).toEqual(content.coreSkills());
  });

  it('links the résumé PDF when configured', () => {
    const link = el.querySelector<HTMLAnchorElement>('a[download]');
    expect(link?.getAttribute('href')).toBe('/resume.pdf');
    expect(link?.classList).toContain('btn--ghost');
  });

  it('sets the meta description from the resolved summary', () => {
    const description = TestBed.inject(Meta).getTag('name="description"')?.content;
    expect(description).toBe(TestBed.inject(Content).summary());
    expect(description).not.toContain('{');
  });

  it('adds Person JSON-LD and removes it on destroy', () => {
    const data = JSON.parse(jsonLd()!.textContent!);
    expect(data['@type']).toBe('Person');
    expect(data.sameAs).toContain('https://github.com/rkram90');

    fixture.destroy();
    expect(jsonLd()).toBeNull();
    expect(TestBed.inject(Meta).getTag('property="og:title"')).toBeNull();
  });
});
