import { Routes } from '@angular/router';
import { SITE } from './core/config/site-config.token';
import { NewsDetailComponent } from './pages/news-detail.component';
import { NewsListComponent } from './pages/news-list.component';
import { NotFoundComponent } from './pages/not-found.component';
import { PageComponent } from './pages/page.component';

// One block of routes per locale, built from site.config.json. Order matters: the concrete
// routes ("news") come before the ":slug" catch-all.
const localeRoutes: Routes = SITE.i18n.locales.flatMap((locale) => {
  const prefix = SITE.i18n.pathPrefix[locale].replace(/^\//, '');
  const at = (p: string) => [prefix, p].filter(Boolean).join('/');
  return [
    { path: at(''), component: PageComponent, data: { locale, slug: 'home' } },
    ...(SITE.features.blog
      ? [
          { path: at('news'), component: NewsListComponent, data: { locale } },
          { path: at('news/:slug'), component: NewsDetailComponent, data: { locale } },
        ]
      : []),
    { path: at(':slug'), component: PageComponent, data: { locale } },
  ];
});

// Locale-prefixed routes (e.g. "hi/:slug") must be matched before the default locale's ":slug".
const defaultFirst = SITE.i18n.defaultLocale;
const ordered = [
  ...localeRoutes.filter((r) => r.data?.['locale'] !== defaultFirst),
  ...localeRoutes.filter((r) => r.data?.['locale'] === defaultFirst),
];

export const routes: Routes = [...ordered, { path: '**', component: NotFoundComponent }];
