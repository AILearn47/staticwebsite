import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SITE } from '../../core/config/site-config.token';
import { ContentService } from '../../core/content/content.service';
import { LinkDirective } from '../../core/i18n/app-link.directive';
import { LocaleService } from '../../core/i18n/locale.service';
import { AnalyticsService } from '../../core/seo/analytics.service';
import { ThemeService } from '../../core/theme/theme.service';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SkipLinkComponent } from '../skip-link/skip-link.component';
import { WhatsappFloatComponent } from '../whatsapp-float/whatsapp-float.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, LinkDirective, HeaderComponent, FooterComponent, BreadcrumbsComponent, SkipLinkComponent, WhatsappFloatComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-skip-link />
    @if (announcement(); as a) {
      <div class="announcement" [class]="'announcement tone-' + (a.tone ?? 'info')">
        <div class="container">
          {{ a.text }}
          @if (a.path && a.linkLabel) {
            <a [appLink]="a.path">{{ a.linkLabel }}</a>
          }
        </div>
      </div>
    }
    <app-header />
    <main id="main" tabindex="-1">
      <app-breadcrumbs />
      <router-outlet />
    </main>
    <app-footer />
    @if (whatsapp) {
      <app-whatsapp-float />
    }
  `,
})
export class ShellComponent {
  private readonly content = inject(ContentService);
  private readonly locale = inject(LocaleService);
  protected readonly whatsapp = SITE.features.whatsappFloat.enabled;
  protected readonly announcement = computed(() => this.content.announcement(this.locale.locale()));

  constructor() {
    inject(ThemeService).init();
    inject(AnalyticsService).init();
  }
}
