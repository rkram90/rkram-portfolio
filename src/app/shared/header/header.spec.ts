import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { Header } from './header';

@Component({ template: '' })
class Blank {}

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let el: HTMLElement;

  const menuButton = () => el.querySelector<HTMLButtonElement>('[aria-controls="site-nav"]')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([{ path: '**', component: Blank }])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('renders every nav link', () => {
    const labels = Array.from(el.querySelectorAll('nav a')).map((a) => a.textContent?.trim());
    expect(labels).toEqual(['About', 'Experience', 'Projects', 'Skills', 'Certifications', 'Writing', 'Contact']);
  });

  it('toggles aria-expanded on the menu button', async () => {
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    menuButton().click();
    await fixture.whenStable();
    expect(menuButton().getAttribute('aria-expanded')).toBe('true');
  });

  it('closes on Escape and returns focus to the menu button', async () => {
    menuButton().click();
    await fixture.whenStable();

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menuButton());
  });

  it('traps Tab focus inside the header while the menu is open', async () => {
    document.body.appendChild(el);
    menuButton().click();
    await fixture.whenStable();

    const focusable = Array.from(el.querySelectorAll<HTMLElement>('a[href], button'));
    const [first, last] = [focusable[0], focusable[focusable.length - 1]];

    last.focus();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);

    first.focus();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);
    el.remove();
  });

  it('closes after navigation', async () => {
    menuButton().click();
    await fixture.whenStable();

    await TestBed.inject(Router).navigateByUrl('/about');
    await fixture.whenStable();

    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
  });

  it('labels the theme toggle with the theme it switches to', () => {
    const toggle = el.querySelector<HTMLButtonElement>('button[aria-label*="theme"]')!;
    expect(toggle.getAttribute('aria-label')).toMatch(/Switch to (dark|light) theme/);
  });
});
