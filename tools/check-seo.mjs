// Verifies the prerendered output: every sitemap URL exists as HTML with title, description,
// canonical, reciprocal hreflang + x-default and exactly one <h1>. Run after `npm run build`.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const cfg = JSON.parse(readFileSync('site.config.json', 'utf8'));
const out = join('dist', cfg.siteId, 'browser');
const base = cfg.domain.replace(/\/$/, '');
const problems = [];

const locs = cfg.i18n.locales.flatMap((l) =>
  [...readFileSync(join(out, `sitemap-${l}.xml`), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    decodeURI(m[1].replace(base, '') || '/'),
  ),
);

const htmlFor = (path) => join(out, path === '/' ? '' : path, 'index.html');
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const pages = new Map();

for (const path of locs) {
  const file = htmlFor(path);
  if (!existsSync(file)) {
    problems.push(`${path}: prerendered file missing (${file})`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  const canonical = links.map((l) => (/rel="canonical"/.test(l) ? attr(l, 'href') : null)).find(Boolean);
  const alts = Object.fromEntries(
    links.filter((l) => /rel="alternate"/.test(l) && attr(l, 'hreflang')).map((l) => [attr(l, 'hreflang'), attr(l, 'href')]),
  );
  pages.set(path, { canonical, alts });
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${path}: missing <title>`);
  if (!/name="description" content="[^"]+"/.test(html)) problems.push(`${path}: missing meta description`);
  if (!canonical) problems.push(`${path}: missing canonical`);
  if (!alts['x-default']) problems.push(`${path}: missing hreflang x-default`);
  const h1 = (html.match(/<h1\b/g) || []).length;
  if (h1 !== 1) problems.push(`${path}: expected 1 <h1>, found ${h1}`);
}

// hreflang must be reciprocal: if A lists B, B must list A.
for (const [path, { canonical, alts }] of pages) {
  for (const [lang, href] of Object.entries(alts)) {
    if (lang === 'x-default') continue;
    const targetPath = decodeURI(href.replace(base, '') || '/');
    const target = pages.get(targetPath);
    if (!target) problems.push(`${path}: hreflang ${lang} points to ${targetPath}, not in sitemap`);
    else if (!Object.values(target.alts).includes(canonical)) problems.push(`${path}: ${targetPath} does not link back`);
  }
}

if (problems.length) {
  console.error(`SEO check failed (${problems.length}):\n  ` + problems.join('\n  '));
  process.exit(1);
}
console.log(`SEO check passed for ${pages.size} pages`);
