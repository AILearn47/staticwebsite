import { localeFromUrl, localizePath, pagePath } from './locale';

describe('locale helpers', () => {
  it('derives the locale from the URL prefix only', () => {
    expect(localeFromUrl('/')).toBe('en');
    expect(localeFromUrl('/about')).toBe('en');
    expect(localeFromUrl('/hi')).toBe('hi');
    expect(localeFromUrl('/mr/sampark?x=1')).toBe('mr');
    expect(localeFromUrl('/history')).toBe('en'); // "/hi" must not match "/history"
  });

  it('prefixes authored paths with the locale', () => {
    expect(localizePath('/contact', 'en')).toBe('/contact');
    expect(localizePath('/contact', 'hi')).toBe('/hi/contact');
    expect(localizePath('/', 'mr')).toBe('/mr');
  });

  it('is idempotent and leaves external links alone', () => {
    expect(localizePath('/hi/contact', 'hi')).toBe('/hi/contact');
    expect(localizePath('https://example.com', 'hi')).toBe('https://example.com');
    expect(localizePath('mailto:a@b.in', 'mr')).toBe('mailto:a@b.in');
  });

  it('builds page paths, serving home at the locale root', () => {
    expect(pagePath('en', 'home')).toBe('/');
    expect(pagePath('hi', 'home')).toBe('/hi');
    expect(pagePath('mr', 'sampark')).toBe('/mr/sampark');
  });
});
