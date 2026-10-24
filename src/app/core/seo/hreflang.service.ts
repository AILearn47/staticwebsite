import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import type { Locale } from '../config/site-config';
import { SITE } from '../config/site-config.token';

@Injectable({ providedIn: 'root' })
export class HreflangService {
  private readonly doc = inject(DOCUMENT);

  /** Emits a reciprocal hreflang set plus x-default (the default-locale URL). */
  set(alternates: Partial<Record<Locale, string>>): void {
    this.doc.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    const base = SITE.domain.replace(/\/$/, '');
    for (const locale of SITE.i18n.locales) {
      const path = alternates[locale];
      if (path !== undefined) this.add(SITE.i18n.hreflangRegion[locale], base + encodeURI(path));
    }
    const def = alternates[SITE.i18n.defaultLocale];
    if (def !== undefined) this.add('x-default', base + encodeURI(def));
  }

  clear(): void {
    this.set({});
  }

  private add(hreflang: string, href: string): void {
    const el = this.doc.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', hreflang);
    el.setAttribute('href', href);
    this.doc.head.appendChild(el);
  }
}
