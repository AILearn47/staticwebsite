import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BlockHostComponent } from '../blocks/block-host.component';
import type { Locale } from '../core/config/site-config';
import { SITE } from '../core/config/site-config.token';
import { ContentService } from '../core/content/content.service';
import type { Page } from '../core/content/content.types';
import { pagePath } from '../core/i18n/locale';
import { TranslateService } from '../core/i18n/translate.service';
import { JsonLdService } from '../core/seo/json-ld.service';
import { PageContextService } from '../core/seo/page-context.service';
import { SeoService } from '../core/seo/seo.service';
import { NotFoundComponent } from './not-found.component';

/** Renders any CMS page by (locale, slug). Locale comes from route data, slug from the route. */
@Component({
  selector: 'app-page',
  imports: [BlockHostComponent, NotFoundComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (page(); as p) {
      @if (p.blocks[0]?.type !== 'hero') {
        <div class="container page-title"><h1>{{ p.title }}</h1></div>
      }
      <app-block-host [blocks]="p.blocks" />
    } @else {
      <app-not-found />
    }
  `,
})
export class PageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);
  private readonly jsonLd = inject(JsonLdService);
  private readonly ctx = inject(PageContextService);
  private readonly i18n = inject(TranslateService);

  protected readonly page = signal<Page | undefined>(undefined);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((params) => {
      const data = this.route.snapshot.data;
      const locale = data['locale'] as Locale;
      const slug = (data['slug'] as string | undefined) ?? params.get('slug') ?? '';
      this.load(locale, slug);
    });
  }

  private load(locale: Locale, slug: string): void {
    const resolved = this.content.resolvePage(locale, slug);
    const path = pagePath(locale, slug);

    if (!resolved) {
      this.page.set(undefined);
      this.ctx.set({}, []);
      this.seo.apply({ locale, title: this.seo.titleFor(this.i18n.t('notFound.title', locale)), path, noindex: true });
      return;
    }

    const { page, fallback } = resolved;
    const isHome = page.translationKey === 'home' || slug === 'home';
    const crumbs = [{ label: this.i18n.t('nav.home', locale), path: pagePath(locale, 'home') }];
    if (!isHome) crumbs.push({ label: page.title, path });

    const alternates = fallback ? {} : this.content.pageAlternates(page.translationKey);
    this.page.set(page);
    this.ctx.set(alternates, crumbs);

    this.seo.apply({
      locale,
      title: page.seo?.title || (isHome ? SITE.name[locale] : this.seo.titleFor(page.title)),
      description: page.seo?.description,
      ogImage: page.seo?.ogImage,
      path,
      // Untranslated pages are shown in the default language and must not be indexed.
      noindex: fallback || page.seo?.noindex,
      alternates,
      jsonLd: [
        ...(isHome ? this.jsonLd.site(locale) : []),
        ...this.jsonLd.breadcrumbs(crumbs),
        ...this.jsonLd.faq(page.blocks),
      ],
    });
  }
}
