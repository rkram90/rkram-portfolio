import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, Renderer2, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { Content } from '../../core/services/content';
import { SITE_URL } from '../../core/site';
import { Button } from '../../shared/button/button';
import { Chip } from '../../shared/chip/chip';
import { ProjectCard } from '../../shared/project-card/project-card';
import { Section } from '../../shared/section/section';
import { Stats } from '../../shared/stats/stats';

// Sectors only — client names stay confidential (see docs 02).
const INDUSTRIES = ['Airlines', 'Telecom', 'Media & Cable'];

@Component({
  selector: 'app-home',
  imports: [RouterLink, Button, Chip, ProjectCard, Section, Stats],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly content = inject(Content);
  protected readonly profile = this.content.profile();
  protected readonly industries = INDUSTRIES.join(' · ');

  constructor() {
    const meta = inject(Meta);
    const summary = this.content.summary();
    meta.updateTag({ name: 'description', content: summary });
    meta.updateTag({ property: 'og:title', content: `${this.profile.name} — ${this.profile.headline}` });
    meta.updateTag({ property: 'og:description', content: summary });
    meta.updateTag({ property: 'og:type', content: 'website' });
    meta.updateTag({ property: 'og:url', content: `${SITE_URL}/` });
    // og:image waits for /og/default.png (see docs README launch blockers).

    const doc = inject(DOCUMENT);
    const renderer = inject(Renderer2);
    const script: HTMLScriptElement = renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(this.personJsonLd());
    renderer.appendChild(doc.head, script);

    inject(DestroyRef).onDestroy(() => {
      renderer.removeChild(doc.head, script);
      for (const p of ['og:title', 'og:description', 'og:type', 'og:url']) meta.removeTag(`property="${p}"`);
    });
  }

  private personJsonLd() {
    const { name, headline, links, location } = this.profile;
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name,
      jobTitle: 'Technology Lead',
      description: headline,
      url: SITE_URL,
      image: `${SITE_URL}/images/profile-photo-192.webp`,
      address: { '@type': 'PostalAddress', addressRegion: location },
      worksFor: { '@type': 'Organization', name: 'Infosys' },
      sameAs: [links.linkedin, links.github, links.blog].filter(Boolean),
    };
  }
}
