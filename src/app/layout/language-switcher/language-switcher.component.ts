import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site-config.token';
import { pagePath } from '../../core/i18n/locale';
import { LocaleService } from '../../core/i18n/locale.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { PageContextService } from '../../core/seo/page-context.service';

/** Maps to the same page in another language via translationKey; falls back to that locale's home. */
@Component({
  selector: 'app-language-switcher',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="lang-switcher" [attr.aria-label]="'a11y.language' | t">
      @for (l of links(); track l.locale) {
        <li>
          <a
            [routerLink]="l.href"
            [attr.lang]="l.locale"
            [attr.hreflang]="l.hreflang"
            [attr.aria-current]="l.current ? 'true' : null"
            [class.current]="l.current"
            >{{ l.label }}</a
          >
        </li>
      }
    </ul>
  `,
})
export class LanguageSwitcherComponent {
  private readonly ctx = inject(PageContextService);
  private readonly localeService = inject(LocaleService);

  protected readonly links = computed(() => {
    const alternates = this.ctx.alternates();
    return SITE.i18n.locales.map((locale) => ({
      locale,
      label: SITE.i18n.localeNames[locale],
      hreflang: SITE.i18n.hreflangRegion[locale],
      href: alternates[locale] ?? pagePath(locale, 'home'),
      current: locale === this.localeService.locale(),
    }));
  });
}
