import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/config/site-config.token';
import { ContentService } from '../../core/content/content.service';
import { LocaleService } from '../../core/i18n/locale.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <p class="footer-name">{{ name() }}</p>
          <p>{{ tagline() }}</p>
        </div>
        <nav [attr.aria-label]="'a11y.footerNav' | t">
          <ul>
            @for (item of nav(); track item.key) {
              <li><a [routerLink]="item.href">{{ 'nav.' + item.key | t }}</a></li>
            }
          </ul>
        </nav>
        <address>
          @if (contact.email) {
            <a [href]="'mailto:' + contact.email">{{ contact.email }}</a>
          }
          @if (contact.phone) {
            <br /><a [href]="'tel:' + contact.phone">{{ contact.phone }}</a>
          }
        </address>
      </div>
      <div class="container footer-legal">
        <p>{{ disclaimer() }}</p>
        <p>© {{ year }} {{ name() }}. {{ 'footer.rights' | t }}</p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  private readonly content = inject(ContentService);
  private readonly localeService = inject(LocaleService);

  protected readonly contact = SITE.contact;
  protected readonly year = new Date().getFullYear();
  protected readonly name = computed(() => SITE.name[this.localeService.locale()]);
  protected readonly tagline = computed(() => SITE.tagline[this.localeService.locale()]);
  protected readonly disclaimer = computed(() => SITE.legal.disclaimer[this.localeService.locale()]);
  protected readonly nav = computed(() => {
    const locale = this.localeService.locale();
    return SITE.navigation.footer.map((i) => ({ key: i.key, href: this.content.navPath(i, locale) }));
  });
}
