import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/core';

import { THEME_STORAGE_KEY, Theme } from './theme';

describe('Theme', () => {
  let root: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    root = TestBed.inject(DOCUMENT).documentElement;
    delete root.dataset['theme'];
  });

  it('reads the theme set by the inline script', () => {
    root.dataset['theme'] = 'dark';
    expect(TestBed.inject(Theme).current()).toBe('dark');
  });

  it('defaults to light when no theme is set', () => {
    expect(TestBed.inject(Theme).current()).toBe('light');
  });

  it('toggles, updates data-theme and persists', () => {
    const theme = TestBed.inject(Theme);
    theme.toggle();
    expect(theme.current()).toBe('dark');
    expect(root.dataset['theme']).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    theme.toggle();
    expect(theme.current()).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });
});
