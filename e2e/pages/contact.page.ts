import type { Page } from '@playwright/test';

export class ContactPage {
  readonly form;
  readonly name;
  readonly email;
  readonly subject;
  readonly message;
  readonly honeypot;
  readonly submit;
  readonly status;

  constructor(page: Page) {
    this.form = page.getByRole('form', { name: 'Contact form' });
    this.name = page.getByLabel('Name', { exact: true });
    this.email = page.getByLabel('Email', { exact: true });
    this.subject = page.getByLabel(/Subject/);
    this.message = page.getByLabel('Message', { exact: true });
    this.honeypot = page.locator('#c-gotcha');
    this.submit = this.form.locator('button[type="submit"]');
    this.status = this.form.locator('.status');
  }

  async fillValid() {
    await this.name.fill('Jane Recruiter');
    await this.email.fill('jane@example.com');
    await this.subject.fill('Tech Lead role');
    await this.message.fill('Hello! We have an Angular Tech Lead opening and would love to chat.');
  }
}
