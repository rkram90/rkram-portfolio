import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contact } from './contact';

describe('Contact', () => {
  let fixture: ComponentFixture<Contact>;
  let component: Contact;
  let el: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => vi.unstubAllGlobals());

  const fillValid = () =>
    component.form.setValue({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: '',
      message: 'Hello, I would like to talk about a Tech Lead role.',
      _gotcha: '',
    });
  const submit = async () => {
    await component.submit();
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  };

  it('labels every field and shows no phone number or address', () => {
    for (const input of Array.from(el.querySelectorAll('input, textarea'))) {
      expect(el.querySelector(`label[for="${input.id}"]`), input.id).not.toBeNull();
    }
    expect(el.textContent).not.toMatch(/phone|\+91|address/i);
  });

  it('shows linked errors and does not send an invalid form', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await submit();
    expect(fetch).not.toHaveBeenCalled();
    const email = el.querySelector('#c-email')!;
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(email.getAttribute('aria-describedby')).toBe('c-email-err');
    expect(el.querySelector('#c-email-err')).not.toBeNull();
  });

  it('posts to Formspree, shows success, resets and focuses the status', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetch);
    component.formId = 'abc123';
    fillValid();
    await submit();
    expect(fetch).toHaveBeenCalledWith('https://formspree.io/f/abc123', expect.objectContaining({ method: 'POST' }));
    expect(JSON.parse(fetch.mock.calls[0][1].body).email).toBe('ada@example.com');
    expect(el.querySelector('.status')?.textContent).toContain('Thanks');
    expect(component.form.value.name).toBe('');
    expect(document.activeElement).toBe(el.querySelector('.status'));
  });

  it('shows the mailto fallback when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    component.formId = 'abc123';
    fillValid();
    await submit();
    expect(component.status()).toBe('error');
    expect(el.querySelector('.status a')?.getAttribute('href')).toMatch(/^mailto:/);
    expect(component.form.enabled).toBe(true);
  });

  it('falls back to mailto when no form ID is configured', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    component.formId = '';
    fillValid();
    await submit();
    expect(fetch).not.toHaveBeenCalled();
    expect(component.status()).toBe('error');
  });
});
