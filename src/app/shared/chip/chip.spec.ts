import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Chip } from './chip';

@Component({
  imports: [Chip],
  template: `<app-chip version="19">Angular</app-chip><app-chip>RxJS</app-chip>`,
})
class Host {}

describe('Chip', () => {
  it('renders the name with an optional muted version', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [withVersion, plain] = fixture.nativeElement.querySelectorAll('app-chip');
    expect(withVersion.textContent).toBe('Angular 19');
    expect(withVersion.querySelector('.version').textContent).toBe(' 19');
    expect(plain.textContent).toBe('RxJS');
  });
});
