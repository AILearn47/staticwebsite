import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE } from '../../core/config/site-config.token';
import { ContentService } from '../../core/content/content.service';
import { pagePath } from '../../core/i18n/locale';
import { LocaleService } from '../../core/i18n/locale.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslateService } from '../../core/i18n/translate.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" [routerLink]="home()" [attr.aria-label]="name()">
          <picture>
            <source media="(prefers-color-scheme: dark)" [srcset]="logo.dark" />
            <img [src]="logo.light" alt="" width="44" height="44" />
          </picture>
          <span>{{ name() }}</span>
        </a>

        <button
          type="button"
          class="nav-toggle"
          [attr.aria-expanded]="open()"
          aria-controls="site-nav"
          (click)="open.set(!open())"
        >
          <span class="visually-hidden">{{ 'a11y.menu' | t }}</span>
          <span aria-hidden="true">{{ open() ? '✕' : '☰' }}</span>
        </button>

        <nav id="site-nav" class="site-nav" [class.open]="open()" [attr.aria-label]="'a11y.mainNav' | t">
          <ul>
            @for (item of nav(); track item.key) {
              <li>
                <a
                  [routerLink]="item.href"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: item.exact }"
                  (click)="open.set(false)"
                  >{{ 'nav.' + item.key | t }}</a
                >
              </li>
            }
          </ul>
          @if (showSwitcher) {
            <app-language-switcher />
          }
          <a class="btn btn-accent" [routerLink]="cta()" (click)="open.set(false)">{{ 'nav.' + ctaKey | t }}</a>
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private readonly content = inject(ContentService);
  private readonly localeService = inject(LocaleService);
  private readonly i18n = inject(TranslateService);

  protected readonly logo = SITE.brand.logo;
  protected readonly showSwitcher = SITE.features.languageSwitcher;
  protected readonly ctaKey = SITE.navigation.cta.key;
  protected readonly open = signal(false);

  protected readonly name = computed(() => SITE.name[this.localeService.locale()]);
  protected readonly home = computed(() => pagePath(this.localeService.locale(), 'home'));
  protected readonly cta = computed(() => this.content.navPath(SITE.navigation.cta, this.localeService.locale()));
  protected readonly nav = computed(() => {
    const locale = this.localeService.locale();
    return SITE.navigation.header
      .filter((i) => (i.key === 'news' ? SITE.features.blog : i.key === 'faq' ? SITE.features.faq : true))
      .map((i) => ({ key: i.key, href: this.content.navPath(i, locale), exact: i.key === 'home' }));
  });
}
