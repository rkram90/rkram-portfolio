import { Directive, input } from '@angular/core';

type Variant = 'primary' | 'ghost';

/** Styles a native link or button: `<a appButton>` (primary) or `<a appButton="ghost">`. See src/styles/_buttons.scss. */
@Directive({
  selector: 'a[appButton], button[appButton]',
  host: {
    class: 'btn',
    '[class.btn--primary]': 'variant() === "primary"',
    '[class.btn--ghost]': 'variant() === "ghost"',
  },
})
export class Button {
  // A bare `appButton` attribute binds "", which means primary.
  readonly variant = input<Variant, Variant | ''>('primary', {
    alias: 'appButton',
    transform: (v) => v || 'primary',
  });
}
