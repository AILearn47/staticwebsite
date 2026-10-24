# Multi-site Static Template — Architecture (v1, no backend)

> **Scope:** a reusable, fully static, 3-language (English / हिंदी / मराठी) Angular template you can
> stand up as 2–10 client sites, each with its own domain and GitHub repo, all SEO-indexed, with a
> non-technical admin editing pages in a browser and a **draft → preview → publish** flow.
>
> **Not in scope here:** user registration, document uploads, AI assistant, WhatsApp. Those need the
> ASP.NET API and are specified in `ARCHITECTURE-PORTAL.md` (v2). This document is deliberately the
> smaller, cheaper first step, and v2 plugs into it without a rewrite.
>
> **How to use:** put this file at the repo root. Copy §10 into `.github/copilot-instructions.md`
> (and/or `CLAUDE.md`). Then run the §11 build prompts in order in VS Code.

---

## 1. Decisions at a glance

| Question | Decision | Why |
|---|---|---|
| Framework | Angular 20+, `outputMode: 'static'` (full prerender) | You know Angular; prerendered HTML is the strongest possible SEO signal and needs no server |
| Hosting | Azure Static Web Apps (Free plan) | 10 apps per subscription = your 10 sites, $0, free SSL, PR preview environments built in |
| Content store | JSON/Markdown files in the site's Git repo | No database, no cost, full version history, instant rollback |
| Admin UI | **Sveltia CMS** at `/admin` (Decap-compatible, actively maintained) | Browser-based editing, commits to Git, supports editorial workflow (draft → PR) |
| Preview | Azure SWA **preview environments**, one per PR, auto-created | Admin sees the real site at a URL before publishing |
| Publish | Admin clicks *Publish* in CMS → PR merges → prod build (~1–2 min) | No developer in the loop |
| i18n | Runtime locale from URL path (`/`, `/hi/`, `/mr/`), one build | Simpler than Angular's per-locale builds; all locales still prerendered |
| Forms | Azure Functions (managed, included free with SWA) | Contact/enquiry only — no DB needed |
| DNS | Cloudflare (free) even if the domain is bought elsewhere | Clean apex-domain support, free CDN/analytics |

**The single most important rule:** nothing site-specific lives in code. It lives in
`site.config.json` (branding/behaviour) or `content/` (words). That is what makes site #3 a 2-hour job.

---

## 2. System diagram

```
   Admin (browser)                            Visitor / Googlebot
        │                                            │
        │  edits at  yoursite.com/admin              │  GET /  /hi/  /mr/...
        ▼                                            ▼
 ┌──────────────────┐                     ┌──────────────────────────────┐
 │  Sveltia CMS     │  commit (branch)    │ Azure Static Web Apps (Free) │
 │  (static JS app  │────────────────────▶│  - prerendered HTML per page │
 │   in /admin)     │                     │    per locale (index.html)   │
 └──────────────────┘                     │  - /sitemap.xml /robots.txt  │
        │  ▲                              │  - free SSL + custom domain  │
        │  │ preview URL                  │  - /api/* managed Functions  │
        ▼  │                              └──────────────────────────────┘
 ┌──────────────────────────────┐                      ▲
 │ GitHub repo (site-xyz)       │  GitHub Actions      │
 │  site.config.json            │─── build (ng) ───────┘
 │  content/{en,hi,mr}/*.json   │    deploy prod  (main branch)
 │  assets/logo.svg             │    deploy preview (open PR) ──▶ https://<pr>.<site>.azurestaticapps.net
 └──────────────────────────────┘
        ▲
        │ template sync (git remote / GitHub "Sync fork" or a sync workflow)
 ┌──────────────────────────────┐
 │ site-template (upstream)     │  ← all shared code lives here
 └──────────────────────────────┘
```

**Sveltia CMS OAuth:** Git-based CMSes need an OAuth broker to let a browser commit to GitHub.
Deploy the one-file **Sveltia CMS Auth** worker to Cloudflare Workers (free tier) once, and reuse
the same worker for all 10 sites. Budget 30 minutes for this, once, ever.

---

## 3. Repository strategy

### 3.1 Upstream template
```
site-template/                      ← GitHub "Template repository"
  src/                              ← Angular app (all shared code)
  public/admin/                     ← CMS shell (index.html + config.yml)
  content/                          ← starter content in 3 locales
  site.config.json                  ← per-site contract (§4)
  i18n/{en,hi,mr}.json              ← UI strings (not page content)
  tools/                            ← sitemap + prerender-route generators
  .github/workflows/azure-swa.yml   ← build + deploy (prod + PR previews)
  staticwebapp.config.json          ← routes, headers, i18n redirects
  ARCHITECTURE-STATIC.md  README.md
```

### 3.2 Per-site repos
Create each from the template (**Use this template**, not a fork — forks of a private template get
messy). A site repo differs from upstream in only 4 places:

```
site-jansahayak/
  site.config.json        ← edited
  public/assets/          ← logo, favicon, og-image
  content/{en,hi,mr}/     ← the client's pages
  src/app/site-blocks/    ← optional: 0–2 custom blocks for this client only
```

**Pulling template improvements into a live site:**
```bash
git remote add template git@github.com:you/site-template.git
git fetch template
git merge template/main --allow-unrelated-histories   # first time only
# later: git merge template/main
```
Conflicts stay rare because the 4 paths above are the only ones you touch per site. Once you have
3+ sites, add a scheduled workflow that opens a "template sync" PR on every site repo weekly.

---

## 4. `site.config.json` — the per-site contract

```jsonc
{
  "siteId": "jansahayak",
  "name": { "en": "JanSahayak", "hi": "जनसहायक", "mr": "जनसहायक" },
  "tagline": {
    "en": "Understand government schemes and your rights",
    "hi": "सरकारी योजनाओं और अपने अधिकारों को समझें",
    "mr": "सरकारी योजना आणि तुमचे हक्क समजून घ्या"
  },
  "domain": "https://www.jansahayak.in",

  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "hi", "mr"],
    "localeNames": { "en": "English", "hi": "हिंदी", "mr": "मराठी" },
    "pathPrefix": { "en": "", "hi": "/hi", "mr": "/mr" },   // default locale at root = best for SEO
    "hreflangRegion": { "en": "en-IN", "hi": "hi-IN", "mr": "mr-IN" },
    "fallbackToDefault": true   // if a page is untranslated, show default-locale content + noindex
  },

  "brand": {
    "logo":      { "light": "/assets/logo.svg", "dark": "/assets/logo-dark.svg" },
    "favicon":   "/assets/favicon.ico",
    "ogImage":   "/assets/og.png"
  },

  "theme": {
    "preset": "civic",                  // civic | modern | minimal  (sets the base token file)
    "colors": {
      "primary":   "#1E5AA8",
      "onPrimary": "#FFFFFF",
      "accent":    "#F28C28",
      "surface":   "#FFFFFF",
      "surfaceAlt":"#F5F7FA",
      "text":      "#14181F",
      "muted":     "#5B6572",
      "border":    "#E3E8EF"
    },
    "fonts": {
      "heading": "Poppins",
      "body": "Noto Sans",
      "indic": "Noto Sans Devanagari"   // REQUIRED for hi/mr rendering
    },
    "radius": "12px",
    "density": "comfortable",
    "darkMode": "auto"                  // auto | light | dark
  },

  "navigation": {
    "header": [
      { "key": "home",     "path": "/" },
      { "key": "about",    "path": "/about" },
      { "key": "services", "path": "/services" },
      { "key": "faq",      "path": "/faq" },
      { "key": "contact",  "path": "/contact" }
    ],
    "footer": [ { "key": "privacy", "path": "/privacy" }, { "key": "terms", "path": "/terms" } ],
    "cta": { "key": "getHelp", "path": "/contact" }
  },

  "features": {
    "blog": true,            // /news + /news/:slug
    "faq": true,
    "contactForm": true,
    "languageSwitcher": true,
    "adSlot": false,
    "whatsappFloat": { "enabled": true, "number": "+91XXXXXXXXXX" }   // click-to-chat link only
  },

  "seo": {
    "titleTemplate": "%s | JanSahayak",
    "defaultDescription": {
      "en": "Guidance on government schemes, subsidies and citizen rights in India.",
      "hi": "भारत में सरकारी योजनाओं, सब्सिडी और नागरिक अधिकारों की जानकारी।",
      "mr": "भारतातील सरकारी योजना, अनुदान आणि नागरिक हक्कांची माहिती."
    },
    "organization": { "name": "JanSahayak Foundation", "type": "NGO", "sameAs": [] },
    "verification": { "google": "", "bing": "" }
  },

  "contact": {
    "email": "help@jansahayak.in",
    "phone": "+91XXXXXXXXXX",
    "address": { "locality": "Pune", "region": "Maharashtra", "country": "IN" },
    "formEndpoint": "/api/contact"
  },

  "analytics": { "ga4": "", "plausible": "" },

  "legal": {
    "disclaimer": {
      "en": "Not affiliated with any government body. Always verify on official portals.",
      "hi": "यह किसी सरकारी संस्था से संबद्ध नहीं है। कृपया आधिकारिक पोर्टल पर पुष्टि करें।",
      "mr": "ही कोणत्याही सरकारी संस्थेशी संलग्न नाही. कृपया अधिकृत पोर्टलवर खात्री करा."
    }
  }
}
```

Typed as `SiteConfig` in `src/app/core/config/site-config.ts`, imported once, and provided through
`SITE_CONFIG` (an `InjectionToken`). Because it is imported at build time, prerendering can read it
and there is zero runtime fetch.

**Theme application:** a build-time step writes the colors/fonts/radius into `:root { --color-primary: … }`
inside the generated `styles.css`, so there is no flash of unstyled content and no runtime work.
Components only ever use `var(--color-primary)` — never a hex literal.

---

## 5. Content model (files, not a database)

```
content/
  en/
    pages/
      home.json  about.json  services.json  faq.json  contact.json  privacy.json
    news/
      2026-09-01-new-subsidy-portal.md
    settings/
      announcement.json          # site-wide banner, editable
  hi/  ...same shape...
  mr/  ...same shape...
```

### 5.1 Page file shape
```jsonc
{
  "slug": "about",
  "locale": "hi",
  "title": "हमारे बारे में",
  "seo": {
    "title": "हमारे बारे में | जनसहायक",
    "description": "जनसहायक के बारे में जानकारी।",
    "ogImage": "/assets/og-about.png",
    "noindex": false
  },
  "translationKey": "about",        // links the en/hi/mr versions → drives hreflang + switcher
  "updatedAt": "2026-09-18",
  "blocks": [
    { "type": "hero", "heading": "…", "sub": "…", "image": "/assets/hero.jpg",
      "ctas": [{ "label": "…", "path": "/contact" }] },
    { "type": "richText", "markdown": "## …\n\n…" },
    { "type": "cardGrid", "columns": 3,
      "cards": [{ "icon": "shield", "title": "…", "text": "…", "path": "/services" }] },
    { "type": "faq", "items": [{ "q": "…", "a": "…" }] },
    { "type": "steps", "items": [{ "title": "…", "text": "…" }] },
    { "type": "cta", "heading": "…", "buttonLabel": "…", "path": "/contact" },
    { "type": "contactForm", "endpoint": "/api/contact" },
    { "type": "embed", "provider": "youtube", "id": "…" },
    { "type": "banner", "text": "…", "tone": "info" }
  ]
}
```

`translationKey` is the backbone of i18n: it is how the language switcher knows that
`/about` ↔ `/hi/about-hum` ↔ `/mr/amchya-vishayi` are the same page, even when slugs differ per
language (which is good for SEO — Hindi/Marathi users search in their own script).

### 5.2 Block catalogue (v1)
`hero · richText · cardGrid · faq · steps · imageText · gallery · cta · contactForm · banner · embed · table · stats · logoStrip`

14 blocks cover essentially every brochure/FAQ/help site. Adding a block = one standalone component
+ one registry entry + one CMS widget definition. Budget 30–45 minutes per new block.

---

## 6. Angular app structure

```
src/app/
  core/
    config/        site-config.ts (types), site-config.token.ts, config.provider.ts
    i18n/          locale.ts (type), locale.token.ts, translate.service.ts, translate.pipe.ts,
                   locale-path.pipe.ts         ← builds locale-correct hrefs everywhere
    content/       content.service.ts          ← loads content JSON (build-time import map)
    seo/           seo.service.ts, json-ld.service.ts, hreflang.service.ts
    theme/         theme.tokens.scss (generated), theme.service.ts (dark-mode toggle only)
  layout/
    shell/ header/ footer/ language-switcher/ breadcrumbs/ skip-link/ whatsapp-float/
  blocks/
    block-host.component.ts        ← switches on block.type
    block-registry.ts              ← type → component map (site repos may extend)
    hero/ rich-text/ card-grid/ faq/ steps/ image-text/ gallery/ cta/
    contact-form/ banner/ embed/ table/ stats/ logo-strip/
  pages/
    page.component.ts              ← renders any CMS page by (locale, slug)
    news-list.component.ts  news-detail.component.ts
    not-found.component.ts
  app.routes.ts
  app.routes.server.ts             ← RenderMode.Prerender for everything public
  site-blocks/                     ← per-site custom blocks (empty in the template)
```

### 6.1 Routing + prerendering

`app.routes.ts` (one locale-aware catch-all, ordered after the static ones):
```ts
export const routes: Routes = [
  { path: '',            component: PageComponent, data: { locale: 'en' } },
  { path: 'news',        component: NewsListComponent, data: { locale: 'en' } },
  { path: 'news/:slug',  component: NewsDetailComponent, data: { locale: 'en' } },
  { path: 'hi',          component: PageComponent, data: { locale: 'hi' } },
  { path: 'hi/news/:slug', /* … */ },
  { path: 'mr', /* … */ },
  { path: ':slug',       component: PageComponent, data: { locale: 'en' } },
  { path: 'hi/:slug',    component: PageComponent, data: { locale: 'hi' } },
  { path: 'mr/:slug',    component: PageComponent, data: { locale: 'mr' } },
  { path: '**',          component: NotFoundComponent }
];
```

`app.routes.server.ts` — every public route is `RenderMode.Prerender`, and parameterised routes
supply their values from the content folder:
```ts
export const serverRoutes: ServerRoute[] = [
  { path: ':slug',    renderMode: RenderMode.Prerender, getPrerenderParams: () => slugsFor('en') },
  { path: 'hi/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: () => slugsFor('hi') },
  { path: 'mr/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: () => slugsFor('mr') },
  { path: 'news/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: () => newsFor('en') },
  // …hi/mr news…
  { path: '**',       renderMode: RenderMode.Prerender }
];
```
`slugsFor()` reads `content/<locale>/pages/*.json` at build time. **Consequence: an admin adding a
page in the CMS automatically produces a new prerendered HTML file and a new sitemap entry, with no
code change.** That is the whole trick.

Build output is plain HTML/CSS/JS in `dist/<app>/browser/` — `index.html`, `about/index.html`,
`hi/about-hum/index.html`, and so on. Azure SWA serves it directly.

### 6.2 Data loading without a server
`ContentService` uses a build-time generated index (`src/generated/content-index.ts`) mapping
`locale/slug → () => import('…json')`. Benefits: type-safe, tree-shaken, no `fetch` during
prerender, and a missing translation is caught at build time rather than in production.

---

## 7. Internationalisation (English / हिंदी / मराठी)

Three distinct layers — keep them separate:

| Layer | Source | Example |
|---|---|---|
| **UI chrome** (buttons, labels, aria text) | `i18n/{en,hi,mr}.json` — edited by you | `"readMore": "और पढ़ें"` |
| **Page content** | `content/<locale>/pages/*.json` — edited by the admin in the CMS | Whole About page in Marathi |
| **Config strings** (site name, tagline, disclaimer) | `site.config.json` keyed by locale | see §4 |

**Why runtime dictionaries instead of `@angular/localize`:** `$localize` needs one build per locale
(3 builds, 3 output folders, `baseHref` juggling). Since the pages are prerendered anyway, a plain
signal-backed `TranslateService` gives the identical SEO result with one build and far less
configuration. Revisit only if the UI string count passes ~500.

**Rules that keep it correct:**
- Locale is derived from the URL path at route resolution, never from a cookie or `navigator.language`
  (crawlers must see stable content per URL).
- Never auto-redirect by browser language; that hides content from crawlers. Offer a switcher instead,
  and optionally a dismissible "View in हिंदी" banner.
- The language switcher maps via `translationKey`, and falls back to the locale home page when the
  current page has no translation.
- All internal links go through `localePath` (pipe/helper). **No raw `routerLink="/about"` anywhere.**
- Load `Noto Sans Devanagari` with `font-display: swap`, subset to Devanagari, and preload it on
  `hi`/`mr` pages only.
- Set `<html lang="hi">` and `dir="ltr"` per prerendered page.
- Dates and numbers: use Angular's `DatePipe`/`DecimalPipe` with the matching locale registered.

**SEO for multilingual (this is what Google needs):**
- Every page emits reciprocal `hreflang` tags for all 3 locales plus `x-default` → the English URL.
- Each locale gets its own self-referencing canonical, never a cross-language canonical.
- Untranslated page with `fallbackToDefault: true` → rendered in English **and marked `noindex`**,
  so you never get duplicate-content penalties for placeholder translations.
- One sitemap per locale under a sitemap index, each entry carrying `xhtml:link` alternates.

---

## 8. Admin experience: edit → preview → publish

### 8.1 What the admin sees
1. Goes to `https://yoursite.com/admin`, signs in with GitHub (one-time invite from you).
2. Picks a language tab (English / हिंदी / मराठी) and a page.
3. Edits blocks in a form UI — add/reorder/delete, rich text with a markdown editor, image upload
   (files land in `public/assets/uploads/` via the same commit).
4. Clicks **Save** → status becomes *Draft*. Sveltia/Decap's `editorial_workflow` creates branch
   `cms/pages-about-hi` and opens a PR.
5. GitHub Actions builds it and Azure SWA publishes a **preview environment**:
   `https://<branch-hash>.<site>.azurestaticapps.net`. The CMS shows this "Preview" link on the card.
6. Admin opens the preview, checks the real rendered page, and moves the card to *Ready*.
7. Clicks **Publish** → PR merges into `main` → production build → live in ~1–2 minutes with the
   sitemap regenerated.

No developer involvement, and every change is a reviewable, revertible commit.

### 8.2 CMS configuration sketch (`public/admin/config.yml`)
```yaml
backend:
  name: github
  repo: you/site-jansahayak
  branch: main
  base_url: https://sveltia-cms-auth.<you>.workers.dev   # shared OAuth worker
publish_mode: editorial_workflow          # ← enables draft → PR → preview → publish
media_folder: public/assets/uploads
public_folder: /assets/uploads
i18n: { structure: multiple_folders, locales: [en, hi, mr], default_locale: en }

collections:
  - name: pages
    label: Pages
    i18n: true
    folder: content/en/pages          # multiple_folders resolves hi/mr automatically
    create: true
    slug: '{{fields.slug}}'
    fields:
      - { name: title, widget: string, i18n: true }
      - { name: slug,  widget: string, i18n: true, hint: "URL part. Use Devanagari for hi/mr." }
      - { name: translationKey, widget: string, i18n: duplicate }
      - label: SEO
        name: seo
        widget: object
        fields:
          - { name: title, widget: string, i18n: true }
          - { name: description, widget: text, i18n: true }
          - { name: ogImage, widget: image, required: false, i18n: duplicate }
          - { name: noindex, widget: boolean, default: false, i18n: duplicate }
      - name: blocks
        widget: list
        types:                               # one entry per block in §5.2
          - { name: hero, widget: object, fields: [ … ] }
          - { name: richText, widget: object, fields: [ { name: markdown, widget: markdown } ] }
          - { name: cardGrid, widget: object, fields: [ … ] }
          # …
  - name: news
    folder: content/en/news
    i18n: true
    create: true
    fields: [ … title, date, cover, excerpt, body(markdown) … ]
  - name: settings
    files:
      - { name: announcement, file: content/en/settings/announcement.json, i18n: true, fields: [ … ] }
```

**Keep `site.config.json` out of the CMS** for non-technical admins — a bad colour or a broken
navigation entry is a support call. Expose theme/logo editing only to yourself, or add it as a
separate collection guarded to owner accounts once you trust the client.

### 8.3 Preview quotas and the small print
- Azure SWA **Free** allows **3 preview environments per app**. That is fine for one or two admins
  working on a few pages at a time; a third open draft blocks the fourth. Standard allows 10.
- Preview URLs are public but unlisted. Add `X-Robots-Tag: noindex` for preview environments via
  `staticwebapp.config.json` so drafts never get crawled.
- Free plan has no SLA and no formal support. Correct for brochure sites, and a $9/month upgrade
  path exists per app when a client needs more.

### 8.4 Your own local loop
```bash
npm start                 # ng serve, hot reload
npx sveltia-cms-server    # local CMS proxy → edits write to the working tree, no commits
npm run build && npx http-server dist/<app>/browser   # verify the real prerendered output
npm run check:seo         # custom script: every page has title/description/canonical/hreflang
```

---

## 9. SEO implementation checklist

Built into the template once, inherited by every site:

- **Prerendered HTML** for every public route in every locale (view-source shows full content).
- `SeoService.apply(page, locale)` sets title (via `titleTemplate`), meta description, canonical,
  Open Graph, and Twitter card. Called by `PageComponent` from the content file — so admins control
  SEO text without touching code.
- **JSON-LD** injected per page type: `Organization` + `WebSite` sitewide, `BreadcrumbList` on every
  inner page, `FAQPage` whenever a `faq` block is present, `Article` on news, `LocalBusiness` when
  `contact.address` is filled.
- **`hreflang`** reciprocal set + `x-default` on every page (§7).
- **`sitemap.xml`** — a sitemap index plus `sitemap-en.xml`, `sitemap-hi.xml`, `sitemap-mr.xml`,
  generated at build time from the content folder with real `lastmod` from `updatedAt`, each `<url>`
  carrying `xhtml:link` alternates.
- **`robots.txt`** generated from config; `Disallow: /admin`.
- **404** page returns a real 404 via `staticwebapp.config.json` `responseOverrides`.
- **Performance budget** enforced in CI: Lighthouse ≥ 95 SEO, ≥ 90 performance on mobile. Static +
  Azure's CDN makes this straightforward; the usual killers are unoptimised hero images and fonts, so
  use `NgOptimizedImage`, WebP/AVIF, and subset fonts.
- **Accessibility:** WCAG 2.1 AA — Lighthouse a11y ≥ 95 in CI, keyboard-navigable switcher, skip link.
- **Search Console:** verify via `seo.verification.google` meta tag, submit the sitemap index once.

`staticwebapp.config.json` essentials:
```jsonc
{
  "trailingSlash": "always",
  "navigationFallback": { "rewrite": "/404/index.html" },
  "responseOverrides": { "404": { "rewrite": "/404/index.html", "statusCode": 404 } },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
  },
  "routes": [
    { "route": "/admin/*", "headers": { "X-Robots-Tag": "noindex" } },
    { "route": "/assets/*", "headers": { "Cache-Control": "public, max-age=31536000, immutable" } }
  ]
}
```

---

## 10. Coding rules (copy into `.github/copilot-instructions.md` / `CLAUDE.md`)

```
PROJECT: Multi-site static template. Angular 20+, prerendered, deployed to Azure Static Web Apps.
No backend, no database. Content is JSON files in content/<locale>/. 3 locales: en, hi, mr.

ANGULAR
- Standalone components only, no NgModules. Signals for state. OnPush change detection everywhere.
- New control flow only: @if / @for / @switch / @defer. Never *ngIf / *ngFor.
- Strict TypeScript. No `any`. Content shapes come from src/app/core/content/content.types.ts.
- inject() over constructor injection.

STATIC / PRERENDER SAFETY
- Never touch window, document, localStorage or navigator at module or constructor level.
  Use afterNextRender() or isPlatformBrowser(). Prerender must not crash.
- No runtime fetch for page content — content is imported through the generated content index.

I18N (non-negotiable)
- Locale comes from the URL path only. Never from a cookie, header or navigator.language.
- Never generate a raw routerLink to an internal path — use the localePath pipe/helper.
- Every user-visible UI string goes in i18n/{en,hi,mr}.json. No hardcoded English in templates.
- Every page emits reciprocal hreflang + x-default and a self-referencing canonical.
- Untranslated page rendered via fallback MUST be noindex.

SEO
- Every routed component calls SeoService.apply(...) and emits the right JSON-LD.
- The sitemap and prerender route list are generated from content/ — never hand-maintained.

THEMING / STYLING
- Never hardcode a colour, font or radius. Use CSS custom properties from theme.tokens.scss,
  which is generated from site.config.json at build time.
- Mobile-first SCSS, WCAG 2.1 AA contrast, min 44px touch targets.
- Devanagari text must use the --font-indic stack.

CONTENT / BLOCKS
- A new block = standalone component + block-registry entry + CMS widget in public/admin/config.yml.
  All three, or it is not done.
- Blocks receive typed input and render nothing when data is missing. Never throw on bad content.

TESTING
- Vitest for services (SeoService, TranslateService, ContentService, localePath).
- Playwright: prerendered HTML contains the expected h1/meta per locale; hreflang set is reciprocal;
  sitemap URLs all return 200.
```

---

## 11. Build prompts (run in order in VS Code)

1. **Scaffold** — "Create an Angular 20 app with SSR/prerendering enabled and `outputMode: 'static'`, the folder structure from ARCHITECTURE-STATIC.md §6, strict TS, SCSS. Add `staticwebapp.config.json` from §9."
2. **Config + theme tokens** — "Implement the `SiteConfig` types for §4, the `SITE_CONFIG` token and provider, and a Node script `tools/gen-theme.mjs` that reads `site.config.json` and writes `src/styles/theme.tokens.scss` as CSS custom properties. Wire it into the `prebuild` npm script."
3. **i18n core** — "Implement `TranslateService` (signal-based, loads `i18n/<locale>.json`), the `t` pipe, `LOCALE` token resolved from route data, and the `localePath` pipe per §7. Add `i18n/en.json`, `hi.json`, `mr.json` with the starter UI strings."
4. **Content layer** — "Define `content.types.ts` for the page/block shapes in §5, write `tools/gen-content-index.mjs` that scans `content/<locale>/` and emits `src/generated/content-index.ts`, and implement `ContentService` on top of it. Run it in `prebuild`."
5. **Blocks + page renderer** — "Implement `BlockHostComponent`, `block-registry.ts`, and these blocks: hero, richText, cardGrid, faq, steps, imageText, cta, banner, contactForm, embed. Then `PageComponent` that renders a page by (locale, slug)."
6. **Routing + prerender** — "Write `app.routes.ts` and `app.routes.server.ts` per §6.1, with `getPrerenderParams` reading the generated content index for each locale."
7. **SEO** — "Implement `SeoService`, `JsonLdService`, `HreflangService` per §9, plus `tools/gen-sitemap.mjs` producing a sitemap index and per-locale sitemaps with `xhtml:link` alternates and `lastmod`, and `robots.txt`. Run in `postbuild`."
8. **Layout** — "Build shell, header with responsive nav, footer, language switcher (maps via `translationKey`, falls back to locale home), breadcrumbs, skip link, and the optional WhatsApp click-to-chat float."
9. **CMS** — "Add `public/admin/index.html` loading Sveltia CMS and `public/admin/config.yml` per §8.2 covering all 10 blocks, pages, news, and settings collections, with `editorial_workflow` and i18n `multiple_folders`."
10. **Contact form** — "Add an Azure Functions HTTP endpoint `api/contact` that validates input, applies a honeypot plus rate limit, and sends email; wire the `contactForm` block to it."
11. **CI/CD** — "Write `.github/workflows/azure-swa.yml`: build on push to `main` (deploy production) and on PR (deploy preview environment), run Vitest, Playwright and a Lighthouse CI budget from §9."
12. **Seed + docs** — "Create starter content for home/about/services/faq/contact/privacy in all 3 locales, add `README.md` with the §12 new-site checklist, and a `npm run new-site` script that prompts for name/colors/domain and rewrites `site.config.json`."

---

## 12. New site in 2–4 hours

| # | Step | Time |
|---|---|---|
| 1 | GitHub → **Use this template** → `site-<client>` | 5 min |
| 2 | `npm run new-site` (name, colors, fonts, domain, features) or edit `site.config.json` | 20 min |
| 3 | Drop in logo, favicon, OG image | 15 min |
| 4 | Azure Portal → Create Static Web App (Free) → connect the repo → workflow auto-committed | 15 min |
| 5 | Point CMS `config.yml` `repo:` at the new repo; invite the admin as a collaborator | 10 min |
| 6 | Write/paste content for 5–8 pages × 3 locales in `/admin` | 60–90 min |
| 7 | Custom domain: add CNAME/ALIAS at Cloudflare → validate in SWA → SSL auto-issues | 20 min |
| 8 | Google Search Console: verify, submit sitemap index. Run Lighthouse. | 20 min |

Translation is the real bottleneck, not the code. Budget client-supplied Hindi/Marathi copy, or use
machine translation as a first draft with a native speaker reviewing — machine-translated Marathi
reads poorly and will undercut trust on a civic site.

---

## 13. Cost for 10 sites

| Item | Free plan | Notes |
|---|---|---|
| Azure Static Web Apps hosting | **$0** | Free plan allows 10 apps per subscription — exactly your 10 |
| Bandwidth | **$0** | 100 GB/month included, **shared across the subscription**, not per app |
| SSL certificates | **$0** | Auto-provisioned and auto-renewed |
| Custom domains | **$0** | 2 per app on Free (apex + www), 5 on Standard |
| Preview environments | **$0** | 3 per app on Free |
| Azure Functions (contact form) | **$0** | 1M executions/month free grant |
| GitHub Actions | **$0** | Public repos free; private repos get 2,000 min/month |
| Cloudflare DNS + CDN | **$0** | Free tier |
| Sveltia OAuth worker | **$0** | Cloudflare Workers free tier (100k req/day) |
| **Domains** | **$10–15/yr each** | ~$8–13/month for 10 domains — *the only real cost* |
| **Total** | **≈ $10–13/month** | Essentially just domain renewals |

**When you would pay:**
- A client needs an SLA, more than 2 custom domains, or more than 3 preview environments → Standard,
  ~$9/app/month. Bill it to that client.
- Combined traffic exceeds 100 GB/month → Free plan **stops serving**, so move the busiest site to
  Standard ($0.20/GB overage) before you get near. 100 GB is roughly 300k–600k page views a month for
  a well-optimised static site, so this is a good problem to have.
- More than 10 sites → the Free-tier cap of 10 apps per subscription cannot be raised. Create a second
  subscription (free to do, separate 100 GB allowance) or move some sites to Cloudflare Pages (free,
  unlimited sites) — the same build output deploys there unchanged.

Verify current figures on the Azure pricing page before you quote a client; tiers change.

---

## 14. Path to v2 (the AI portal)

Nothing here needs to be thrown away:

| v2 need | How it attaches |
|---|---|
| User registration | Add Entra External ID; auth-only routes become `RenderMode.Client` — public pages stay prerendered |
| Document upload | New `/api` endpoints + Blob Storage; a new `uploadForm` block |
| AI assistant | `aiChat` block + a floating widget calling the ASP.NET API; loaded with `@defer` so static pages stay fast |
| Q&A / schemes / GR at scale | Content moves from files to Azure SQL; switch those routes to `RenderMode.Server` on App Service. The block system, SEO layer, i18n and theming are unchanged. |
| WhatsApp bot | Separate API surface; shares the same content |

Migration trigger: when content exceeds roughly 200 pages per locale, or when a human must log in.
Below that, files are cheaper, faster and simpler.
