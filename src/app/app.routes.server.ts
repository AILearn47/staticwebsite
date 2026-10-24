import { RenderMode, ServerRoute } from '@angular/ssr';
import { SITE } from './core/config/site-config.token';
import { newsFor, slugsFor } from './core/content/content.repo';

// Every public route is prerendered. Parameters come from the content folder, so a page or news
// item added in the CMS becomes a new HTML file on the next build with no code change.
const localeRoutes: ServerRoute[] = [];

for (const locale of SITE.i18n.locales) {
  const prefix = SITE.i18n.pathPrefix[locale].replace(/^\//, '');
  const at = (p: string) => [prefix, p].filter(Boolean).join('/');

  localeRoutes.push({ path: at(''), renderMode: RenderMode.Prerender });
  if (SITE.features.blog) {
    localeRoutes.push(
      { path: at('news'), renderMode: RenderMode.Prerender },
      {
        path: at('news/:slug'),
        renderMode: RenderMode.Prerender,
        getPrerenderParams: async () => newsFor(locale).map((n) => ({ slug: n.slug })),
      },
    );
  }
  localeRoutes.push({
    path: at(':slug'),
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => slugsFor(locale).map((slug) => ({ slug })),
  });
}

export const serverRoutes: ServerRoute[] = [...localeRoutes, { path: '**', renderMode: RenderMode.Prerender }];
