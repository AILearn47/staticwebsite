import { Injectable, signal } from '@angular/core';
import type { Locale } from '../config/site-config';
import type { Crumb } from './json-ld.service';

/** What the current page tells the shell: its translations (for the switcher) and breadcrumbs. */
@Injectable({ providedIn: 'root' })
export class PageContextService {
  readonly alternates = signal<Partial<Record<Locale, string>>>({});
  readonly breadcrumbs = signal<Crumb[]>([]);

  set(alternates: Partial<Record<Locale, string>>, breadcrumbs: Crumb[]): void {
    this.alternates.set(alternates);
    this.breadcrumbs.set(breadcrumbs);
  }
}
