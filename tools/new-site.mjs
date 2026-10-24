// Interactive: rewrites the identity fields of site.config.json for a new client site.
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

const cfg = JSON.parse(readFileSync('site.config.json', 'utf8'));
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = async (q, def) => (await rl.question(`${q} [${def}]: `)).trim() || def;

const oldId = cfg.siteId;
const siteId = await ask('Site id (lowercase, no spaces)', cfg.siteId);
const nameEn = await ask('Name (English)', cfg.name.en);
const nameHi = await ask('Name (Hindi)', cfg.name.hi);
const nameMr = await ask('Name (Marathi)', cfg.name.mr);
const domain = await ask('Domain (https://…)', cfg.domain);
const primary = await ask('Primary colour', cfg.theme.colors.primary);
const accent = await ask('Accent colour', cfg.theme.colors.accent);
const email = await ask('Contact email', cfg.contact.email);
rl.close();

cfg.siteId = siteId;
cfg.name = { en: nameEn, hi: nameHi, mr: nameMr };
cfg.domain = domain;
cfg.theme.colors.primary = primary;
cfg.theme.colors.accent = accent;
cfg.contact.email = email;
cfg.seo.titleTemplate = `%s | ${nameEn}`;
cfg.seo.organization.name = nameEn;

writeFileSync('site.config.json', JSON.stringify(cfg, null, 2) + '\n');

// The build output folder is named after the Angular project; keep it in sync.
for (const f of ['angular.json', 'package.json']) {
  writeFileSync(f, readFileSync(f, 'utf8').replaceAll(oldId, siteId));
}
console.log('\nUpdated site.config.json. Next: replace public/assets/*, edit content/, set repo in public/admin/config.yml.');
