import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import type { Locale } from '../core/config/site-config';
import { ContentService } from '../core/content/content.service';
import type { NewsItem } from '../core/content/content.types';
import { renderMarkdown } from '../core/content/markdown';
import { LinkDirective } from '../core/i18n/app-link.directive';
import { newsListPath, newsPath, pagePath } from '../core/i18n/locale';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { TranslateService } from '../core/i18n/translate.service';
import { JsonLdService } from '../core/seo/json-ld.service';
import { PageContextService } from '../core/seo/page-context.service';
import { SeoService } from '../core/seo/seo.service';
import { NotFoundComponent } from './not-found.component';

@Component({
  selector: 'app-news-detail',
  imports: [DatePipe, LinkDirective, TranslatePipe, NotFoundComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (item(); as n) {
      <article class="section">
        <div class="container narrow">
          <a class="card-link" [appLink]="listPath">← {{ 'news.title' | t }}</a>
          <h1>{{ n.title }}</h1>
          <time [attr.datetime]="n.date">{{ n.date | date: 'longDate' : undefined : locale }}</time>
          @if (n.cover) {
            <img class="rounded cover" [src]="n.cover" alt="" decoding="async" />
          }
          <div class="prose" [innerHTML]="html()"></div>
        </div>
      </article>
    } @else {
      <app-not-found />
    }
  `,
})
export class NewsDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);
  private readonly jsonLd = inject(JsonLdService);
  private readonly ctx = inject(PageContextService);
  private readonly i18n = inject(TranslateService);

  protected readonly locale = this.route.snapshot.data['locale'] as Locale;
  protected readonly listPath = newsListPath(this.locale);
  protected readonly item = signal<NewsItem | undefined>(undefined);
  protected readonly html = signal('');

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((p) => {
      const n = this.content.newsBySlug(this.locale, p.get('slug') ?? '');
      this.item.set(n);
      this.html.set(renderMarkdown(n?.body));
      if (n) this.apply(n);
    });
  }

  private apply(n: NewsItem): void {
    const path = newsPath(this.locale, n.slug);
    const crumbs = [
      { label: this.i18n.t('nav.home', this.locale), path: pagePath(this.locale, 'home') },
      { label: this.i18n.t('news.title', this.locale), path: newsListPath(this.locale) },
      { label: n.title, path },
    ];
    const alternates = this.content.newsAlternates(n);
    this.ctx.set(alternates, crumbs);
    this.seo.apply({
      locale: this.locale,
      title: n.seo?.title || this.seo.titleFor(n.title),
      description: n.seo?.description || n.excerpt,
      ogImage: n.seo?.ogImage || n.cover,
      path,
      type: 'article',
      noindex: n.seo?.noindex,
      alternates,
      jsonLd: [...this.jsonLd.breadcrumbs(crumbs), ...this.jsonLd.article(n, path)],
    });
  }
}
