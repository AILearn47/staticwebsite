import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Locale } from '../core/config/site-config';
import { SITE } from '../core/config/site-config.token';
import { ContentService } from '../core/content/content.service';
import { LinkDirective } from '../core/i18n/app-link.directive';
import { newsListPath, newsPath, pagePath } from '../core/i18n/locale';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { TranslateService } from '../core/i18n/translate.service';
import { JsonLdService } from '../core/seo/json-ld.service';
import { PageContextService } from '../core/seo/page-context.service';
import { SeoService } from '../core/seo/seo.service';

@Component({
  selector: 'app-news-list',
  imports: [DatePipe, LinkDirective, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <h1>{{ 'news.title' | t }}</h1>
        @if (items.length) {
          <div class="grid" data-cols="2">
            @for (n of items; track n.slug) {
              <article class="card">
                @if (n.cover) {
                  <img class="rounded" [src]="n.cover" alt="" loading="lazy" decoding="async" />
                }
                <time [attr.datetime]="n.date">{{ n.date | date: 'longDate' : undefined : locale }}</time>
                <h2 class="h3"><a [appLink]="path(n.slug)">{{ n.title }}</a></h2>
                @if (n.excerpt) {
                  <p>{{ n.excerpt }}</p>
                }
              </article>
            }
          </div>
        } @else {
          <p>{{ 'news.empty' | t }}</p>
        }
      </div>
    </section>
  `,
})
export class NewsListComponent {
  private readonly content = inject(ContentService);
  protected readonly locale = inject(ActivatedRoute).snapshot.data['locale'] as Locale;
  protected readonly items = this.content.newsFor(this.locale);

  constructor() {
    const i18n = inject(TranslateService);
    const seo = inject(SeoService);
    const title = i18n.t('news.title', this.locale);
    const crumbs = [
      { label: i18n.t('nav.home', this.locale), path: pagePath(this.locale, 'home') },
      { label: title, path: newsListPath(this.locale) },
    ];
    const alternates = Object.fromEntries(
      SITE.i18n.locales.map((l) => [l, newsListPath(l)]),
    ) as Record<Locale, string>;
    inject(PageContextService).set(alternates, crumbs);
    seo.apply({
      locale: this.locale,
      title: seo.titleFor(title),
      description: i18n.t('news.description', this.locale),
      path: newsListPath(this.locale),
      alternates,
      jsonLd: inject(JsonLdService).breadcrumbs(crumbs),
    });
  }

  protected path(slug: string): string {
    return newsPath(this.locale, slug);
  }
}
