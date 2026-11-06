import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

export type ThemeName = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

/**
 * The initial theme is applied by the inline script in index.html before first paint;
 * this service reads that value and owns all later changes.
 */
@Injectable({
  providedIn: 'root',
})
export class Theme {
  private readonly root = inject(DOCUMENT).documentElement;

  readonly current = signal<ThemeName>(this.root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  toggle(): void {
    this.set(this.current() === 'dark' ? 'light' : 'dark');
  }

  set(theme: ThemeName): void {
    this.current.set(theme);
    this.root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage unavailable (private mode, SSR) — theme still applies for this visit.
    }
  }
}
