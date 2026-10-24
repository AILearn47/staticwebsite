import { Injectable } from '@angular/core';
import type { Locale, NavItem } from '../config/site-config';
import {
  ResolvedPage,
  announcementFor,
  navPath,
  newsAlternates,
  newsBySlug,
  newsFor,
  pageAlternates,
  resolvePage,
} from './content.repo';

/** Thin injectable wrapper so components/tests can depend on content via DI. */
@Injectable({ providedIn: 'root' })
export class ContentService {
  resolvePage(locale: Locale, slug: string): ResolvedPage | undefined {
    return resolvePage(locale, slug);
  }
  pageAlternates = pageAlternates;
  newsAlternates = newsAlternates;
  newsFor = newsFor;
  newsBySlug = newsBySlug;
  announcement = announcementFor;
  navPath(item: NavItem, locale: Locale): string {
    return navPath(item, locale);
  }
}
