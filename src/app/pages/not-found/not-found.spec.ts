import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/core';
import { provideRouter } from '@angular/router';

import { NotFound } from './not-found';

describe('NotFound', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders a single h1 and recovery links', async () => {
    const fixture = TestBed.createComponent(NotFound);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(Array.from(el.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toEqual([
      '/',
      '/projects',
      '/contact',
    ]);
  });

  it('adds robots noindex while shown and removes it afterwards', async () => {
    const doc = TestBed.inject(DOCUMENT);
    const fixture = TestBed.createComponent(NotFound);
    await fixture.whenStable();
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');

    fixture.destroy();
    expect(doc.querySelector('meta[name="robots"]')).toBeNull();
  });
});
