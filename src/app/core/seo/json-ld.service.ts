import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import type { Locale } from '../config/site-config';
import { SITE } from '../config/site-config.token';
import type { Block, FaqBlock, NewsItem } from '../content/content.types';

export type JsonLd = Record<string, unknown>;
export interface Crumb {
  label: string;
  path: string;
}

const abs = (path: string) => SITE.domain.replace(/\/$/, '') + encodeURI(path);

@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private readonly doc = inject(DOCUMENT);

  /** Replaces all JSON-LD scripts we manage on the page. */
  set(items: JsonLd[]): void {
    this.doc.head.querySelectorAll('script[data-jsonld]').forEach((el) => el.remove());
    for (const item of items) {
      const el = this.doc.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute('data-jsonld', '');
      el.textContent = JSON.stringify(item).replace(/</g, '\\u003c');
      this.doc.head.appendChild(el);
    }
  }

  site(locale: Locale): JsonLd[] {
    const name = SITE.name[locale];
    const org: JsonLd = {
      '@context': 'https://schema.org',
      '@type': SITE.seo.organization.type === 'NGO' ? 'NGO' : 'Organization',
      name: SITE.seo.organization.name || name,
      url: SITE.domain,
      logo: abs(SITE.brand.logo.light),
      ...(SITE.seo.organization.sameAs.length ? { sameAs: SITE.seo.organization.sameAs } : {}),
      ...(SITE.contact.email ? { email: SITE.contact.email } : {}),
    };
    const a = SITE.contact.address;
    if (a.locality) {
      org['address'] = {
        '@type': 'PostalAddress',
        addressLocality: a.locality,
        addressRegion: a.region,
        addressCountry: a.country,
      };
    }
    return [
      org,
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url: SITE.domain,
        inLanguage: SITE.i18n.hreflangRegion[locale],
      },
    ];
  }

  breadcrumbs(crumbs: Crumb[]): JsonLd[] {
    if (crumbs.length < 2) return [];
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.label,
          item: abs(c.path),
        })),
      },
    ];
  }

  faq(blocks: Block[]): JsonLd[] {
    const items = blocks
      .filter((b): b is FaqBlock => b.type === 'faq')
      .flatMap((b) => b.items ?? [])
      .filter((i) => i.q && i.a);
    if (!items.length) return [];
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((i) => ({
          '@type': 'Question',
          name: i.q,
          acceptedAnswer: { '@type': 'Answer', text: i.a },
        })),
      },
    ];
  }

  article(item: NewsItem, path: string): JsonLd[] {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: item.title,
        datePublished: item.date,
        dateModified: item.date,
        inLanguage: SITE.i18n.hreflangRegion[item.locale],
        mainEntityOfPage: abs(path),
        image: abs(item.cover || SITE.brand.ogImage),
        author: { '@type': 'Organization', name: SITE.seo.organization.name },
        publisher: { '@type': 'Organization', name: SITE.seo.organization.name },
      },
    ];
  }
}
