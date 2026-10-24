import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import type { Locale } from '../config/site-config';
import { SITE } from '../config/site-config.token';
import { HreflangService } from './hreflang.service';
import { JsonLd, JsonLdService } from './json-ld.service';

export interface SeoInput {
  locale: Locale;
  /** Fully formed <title>. Use titleFor() to apply the site template. */
  title: string;
  description?: string;
  /** Locale-prefixed path of this page, used for the canonical URL. */
  path: string;
  ogImage?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  /** Real translations of this page. Omit for noindex fallback pages. */
  alternates?: Partial<Record<Locale, string>>;
  jsonLd?: JsonLd[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly hreflang = inject(HreflangService);
  private readonly jsonLd = inject(JsonLdService);

  titleFor(raw: string): string {
    return SITE.seo.titleTemplate.replace('%s', raw);
  }

  apply(i: SeoInput): void {
    const base = SITE.domain.replace(/\/$/, '');
    const url = base + encodeURI(i.path);
    const description = i.description || SITE.seo.defaultDescription[i.locale];
    const image = base + (i.ogImage || SITE.brand.ogImage);

    this.doc.documentElement.setAttribute('lang', i.locale);
    this.doc.documentElement.setAttribute('dir', 'ltr');
    this.title.setTitle(i.title);

    const tags: Record<string, string> = {
      description,
      robots: i.noindex ? 'noindex,follow' : 'index,follow',
      'og:title': i.title,
      'og:description': description,
      'og:type': i.type ?? 'website',
      'og:url': url,
      'og:image': image,
      'og:site_name': SITE.name[i.locale],
      'og:locale': SITE.i18n.hreflangRegion[i.locale].replace('-', '_'),
      'twitter:card': 'summary_large_image',
      'twitter:title': i.title,
      'twitter:description': description,
      'twitter:image': image,
    };
    if (SITE.seo.verification.google) tags['google-site-verification'] = SITE.seo.verification.google;
    if (SITE.seo.verification.bing) tags['msvalidate.01'] = SITE.seo.verification.bing;

    for (const [name, content] of Object.entries(tags)) {
      const attr = name.startsWith('og:') ? 'property' : 'name';
      this.meta.updateTag({ [attr]: name, content }, `${attr}="${name}"`);
    }

    this.setCanonical(url);
    this.hreflang.set(i.noindex ? {} : (i.alternates ?? {}));
    this.jsonLd.set(i.jsonLd ?? []);
  }

  private setCanonical(href: string): void {
    let el = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!el) {
      el = this.doc.createElement('link');
      el.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }
}
