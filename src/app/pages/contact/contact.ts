import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta } from '@angular/platform-browser';

import { Content } from '../../core/services/content';
import { FORMSPREE_ID } from '../../core/site';
import { Button } from '../../shared/button/button';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** Backend-less contact form posting to Formspree (see docs pages/contact.md). */
@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, Button],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  protected readonly profile = inject(Content).profile();
  private readonly statusEl = viewChild.required<ElementRef<HTMLElement>>('statusRegion');

  /** Overridable in tests. */
  formId = FORMSPREE_ID;
  readonly status = signal<Status>('idle');
  readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: [''],
    message: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    _gotcha: [''], // honeypot: bots fill it, people never see it
  });

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content: 'Contact Ramkumar Karuppaiah about Tech Lead and senior Angular / full-stack roles.',
    });
  }

  /** Show a field's errors once the user has left it or tried to submit. */
  invalid(name: 'name' | 'email' | 'message'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('submitting');
    this.form.disable();
    try {
      if (!this.formId) throw new Error('Formspree form ID not configured');
      const res = await fetch(`https://formspree.io/f/${this.formId}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(this.form.getRawValue()),
      });
      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
      this.status.set('success');
      this.form.reset();
    } catch {
      this.status.set('error');
    } finally {
      this.form.enable();
      // Move focus to the result so screen-reader and keyboard users hear it.
      queueMicrotask(() => this.statusEl().nativeElement.focus());
    }
  }
}
