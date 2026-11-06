import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Button } from './button';

@Component({
  imports: [Button],
  template: `<a href="/x" appButton>Primary</a><button type="button" appButton="ghost">Ghost</button>`,
})
class Host {}

describe('Button', () => {
  it('adds variant classes, defaulting to primary', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [link, button] = fixture.nativeElement.querySelectorAll('.btn');

    expect(link.className).toBe('btn btn--primary');
    expect(button.className).toBe('btn btn--ghost');
  });
});
