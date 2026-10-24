// Postbuild: sitemap index + per-locale sitemaps (with xhtml:link alternates) + robots.txt.
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const cfg = JSON.parse(readFileSync('site.config.json', 'utf8'));
const { locales, defaultLocale, pathPrefix, hreflangRegion } = cfg.i18n;
const out = join('dist', cfg.siteId, 'browser');
const base = cfg.domain.replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const url = (path) => base + encodeURI(path);
const pagePath = (l, slug) => (slug === 'home' ? pathPrefix[l] || '/' : `${pathPrefix[l]}/${slug}`);
const newsPath = (l, slug) => `${pathPrefix[l]}/news/${slug}`;

const read = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => {
          const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
          return { ...d, slug: d.slug || basename(f, '.json') };
        })
    : [];

const entries = []; // { locale, kind, key, path, lastmod }
for (const locale of locales) {
  for (const p of read(join('content', locale, 'pages'))) {
    if (p.seo?.noindex) continue;
    entries.push({ locale, kind: 'page', key: p.translationKey, path: pagePath(locale, p.slug), lastmod: p.updatedAt });
  }
  const list = read(join('content', locale, 'news'));
  if (cfg.features.blog) {
    entries.push({ locale, kind: 'newsList', key: 'news', path: `${pathPrefix[locale]}/news`, lastmod: list[0]?.date });
    for (const n of list) {
      entries.push({ locale, kind: 'news', key: n.translationKey || `${locale}:${n.slug}`, path: newsPath(locale, n.slug), lastmod: n.date });
    }
  }
}

const groupKey = (e) => `${e.kind}:${e.key}`;
const groups = new Map();
for (const e of entries) groups.set(groupKey(e), [...(groups.get(groupKey(e)) ?? []), e]);

for (const locale of locales) {
  const urls = entries
    .filter((e) => e.locale === locale)
    .map((e) => {
      const alts = groups.get(groupKey(e));
      const links = alts.map((a) => `    <xhtml:link rel="alternate" hreflang="${hreflangRegion[a.locale]}" href="${esc(url(a.path))}"/>`);
      const def = alts.find((a) => a.locale === defaultLocale);
      if (def) links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(url(def.path))}"/>`);
      return `  <url>\n    <loc>${esc(url(e.path))}</loc>\n    <lastmod>${e.lastmod || today}</lastmod>\n${links.join('\n')}\n  </url>`;
    });
  writeFileSync(
    join(out, `sitemap-${locale}.xml`),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
  );
}

writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locales
    .map((l) => `  <sitemap><loc>${base}/sitemap-${l}.xml</loc><lastmod>${today}</lastmod></sitemap>`)
    .join('\n')}\n</sitemapindex>\n`,
);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${base}/sitemap.xml\n`);
// Angular's static output has no 404 page; the client-rendered shell shows <app-not-found>
// for unknown URLs. staticwebapp.config.json serves it with a real 404 status.
copyFileSync(join(out, 'index.csr.html'), join(out, '404.html'));
console.log(`sitemaps written for ${locales.join(', ')} (${entries.length} URLs)`);
