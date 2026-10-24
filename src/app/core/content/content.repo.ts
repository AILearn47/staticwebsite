import { ANNOUNCEMENTS, NEWS, PAGES } from '../../../generated/content-index';
import type { Locale, NavItem } from '../config/site-config';
import { SITE } from '../config/site-config.token';
import { DEFAULT_LOCALE, LOCALES, localizePath, newsListPath, newsPath, pagePath } from '../i18n/locale';
import type { Announcement, NewsItem, Page } from './content.types';

// Pure lookups over the generated content index. No DI, so server routes can use them too.

export function pageBySlug(locale: Locale, slug: string): Page | undefined {
  return PAGES.find((p) => p.locale === locale && p.slug === slug);
}

export function pageByKey(locale: Locale, key: string): Page | undefined {
  return PAGES.find((p) => p.locale === locale && p.translationKey === key);
}

export interface ResolvedPage {
  page: Page;
  /** True when shown from the default locale because the translation is missing. */
  fallback: boolean;
}

export function resolvePage(locale: Locale, slug: string): ResolvedPage | undefined {
  const own = pageBySlug(locale, slug);
  if (own) return { page: own, fallback: false };
  if (SITE.i18n.fallbackToDefault && locale !== DEFAULT_LOCALE) {
    const def = pageBySlug(DEFAULT_LOCALE, slug);
    if (def) return { page: def, fallback: true };
  }
  return undefined;
}

/** Slugs to prerender under a locale prefix (the home page is served at the prefix itself). */
export function slugsFor(locale: Locale): string[] {
  const slugs = new Set(PAGES.filter((p) => p.locale === locale).map((p) => p.slug));
  if (SITE.i18n.fallbackToDefault && locale !== DEFAULT_LOCALE) {
    PAGES.filter((p) => p.locale === DEFAULT_LOCALE).forEach((p) => slugs.add(p.slug));
  }
  slugs.delete('home');
  return [...slugs];
}

export function newsFor(locale: Locale): NewsItem[] {
  return NEWS.filter((n) => n.locale === locale).sort((a, b) => b.date.localeCompare(a.date));
}

export function newsBySlug(locale: Locale, slug: string): NewsItem | undefined {
  return NEWS.find((n) => n.locale === locale && n.slug === slug);
}

export function pageAlternates(key: string): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const l of LOCALES) {
    const p = pageByKey(l, key);
    if (p) out[l] = pagePath(l, p.slug);
  }
  return out;
}

export function newsAlternates(item: NewsItem): Partial<Record<Locale, string>> {
  if (!item.translationKey) return { [item.locale]: newsPath(item.locale, item.slug) };
  const out: Partial<Record<Locale, string>> = {};
  for (const n of NEWS.filter((x) => x.translationKey === item.translationKey)) {
    out[n.locale] = newsPath(n.locale, n.slug);
  }
  return out;
}

export function announcementFor(locale: Locale): Announcement | undefined {
  const a = ANNOUNCEMENTS[locale];
  return a?.enabled && a.text ? a : undefined;
}

/** Nav entries link by translationKey so slugs may differ per language. */
export function navPath(item: NavItem, locale: Locale): string {
  const page = pageByKey(locale, item.key);
  if (page) return pagePath(locale, page.slug);
  if (item.key === 'news') return newsListPath(locale);
  return localizePath(item.path, locale);
}
