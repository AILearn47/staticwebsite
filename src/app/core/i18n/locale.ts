import type { Locale } from '../config/site-config';
import { SITE } from '../config/site-config.token';

export type { Locale };

const { defaultLocale, locales, pathPrefix } = SITE.i18n;

export const DEFAULT_LOCALE = defaultLocale;
export const LOCALES = locales;

/** Locale is always derived from the URL path, never from cookies or the browser. */
export function localeFromUrl(url: string): Locale {
  const path = url.split(/[?#]/)[0];
  for (const l of locales) {
    const p = pathPrefix[l];
    if (p && (path === p || path.startsWith(p + '/'))) return l;
  }
  return defaultLocale;
}

export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:|#)/i.test(path);
}

/** Prefixes an authored path ("/contact") with the locale prefix. Idempotent. */
export function localizePath(path: string, locale: Locale): string {
  if (!path || isExternal(path) || !path.startsWith('/')) return path;
  if (locales.some((l) => pathPrefix[l] && (path === pathPrefix[l] || path.startsWith(pathPrefix[l] + '/')))) {
    return path;
  }
  const prefix = pathPrefix[locale];
  return path === '/' ? prefix || '/' : prefix + path;
}

export function pagePath(locale: Locale, slug: string): string {
  return slug === 'home' ? pathPrefix[locale] || '/' : `${pathPrefix[locale]}/${slug}`;
}

export function newsListPath(locale: Locale): string {
  return `${pathPrefix[locale]}/news`;
}

export function newsPath(locale: Locale, slug: string): string {
  return `${newsListPath(locale)}/${slug}`;
}
