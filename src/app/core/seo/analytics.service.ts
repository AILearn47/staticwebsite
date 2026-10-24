import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { SITE } from '../config/site-config.token';

/** Loads Plausible and/or GA4 in the browser only, and only when configured. */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  init(): void {
    if (!this.browser) return;
    const { plausible, ga4 } = SITE.analytics;
    if (plausible) {
      this.script('https://plausible.io/js/script.js', { defer: '', 'data-domain': plausible });
    }
    if (ga4 && /^G-[A-Z0-9]+$/.test(ga4)) {
      this.script(`https://www.googletagmanager.com/gtag/js?id=${ga4}`, { async: '' });
      const inline = this.doc.createElement('script');
      inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4}');`;
      this.doc.head.appendChild(inline);
    }
  }

  private script(src: string, attrs: Record<string, string>): void {
    const el = this.doc.createElement('script');
    el.src = src;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    this.doc.head.appendChild(el);
  }
}
