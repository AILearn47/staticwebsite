import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { SITE } from '../config/site-config.token';

/** Colours/radius are baked into CSS at build time; this only adds the web-font stylesheet. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  init(): void {
    const { heading, body, indic } = SITE.theme.fonts;
    const fam = (name: string, weights: string) => `family=${name.replace(/ /g, '+')}:wght@${weights}`;
    const href =
      'https://fonts.googleapis.com/css2?' +
      [fam(heading, '600;700'), fam(body, '400;600'), fam(indic, '400;600')].join('&') +
      '&display=swap';

    this.link('preconnect', 'https://fonts.googleapis.com');
    this.link('preconnect', 'https://fonts.gstatic.com', true);
    this.link('stylesheet', href);
  }

  private link(rel: string, href: string, crossorigin = false): void {
    if (this.doc.head.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
    const el = this.doc.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute('href', href);
    if (crossorigin) el.setAttribute('crossorigin', '');
    this.doc.head.appendChild(el);
  }
}
