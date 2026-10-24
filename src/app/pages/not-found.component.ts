import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Locale, localeFromUrl } from '../core/i18n/locale';
import { LinkDirective } from '../core/i18n/app-link.directive';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { PageContextService } from '../core/seo/page-context.service';
import { SeoService } from '../core/seo/seo.service';
import { TranslateService } from '../core/i18n/translate.service';

@Component({
  selector: 'app-not-found',
  imports: [LinkDirective, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container narrow center">
        <h1>{{ 'notFound.title' | t }}</h1>
        <p>{{ 'notFound.text' | t }}</p>
        <a class="btn btn-primary" appLink="/">{{ 'notFound.home' | t }}</a>
      </div>
    </section>
  `,
})
export class NotFoundComponent {
  constructor() {
    // Used both as the `**` route and inline by PageComponent; the latter sets its own SEO.
    const router = inject(Router);
    const seo = inject(SeoService);
    const i18n = inject(TranslateService);
    const locale: Locale = localeFromUrl(router.url);
    inject(PageContextService).set({}, []);
    seo.apply({ locale, title: seo.titleFor(i18n.t('notFound.title', locale)), path: router.url.split(/[?#]/)[0], noindex: true });
  }
}
