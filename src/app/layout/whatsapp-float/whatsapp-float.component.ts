import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../core/config/site-config.token';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

/** Click-to-chat link only (no API). Hidden until a real number is configured. */
@Component({
  selector: 'app-whatsapp-float',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (digits.length >= 10) {
      <a class="whatsapp-float" [href]="'https://wa.me/' + digits" rel="noopener" target="_blank" [attr.aria-label]="'a11y.whatsapp' | t">
        <span aria-hidden="true">💬</span>
      </a>
    }
  `,
})
export class WhatsappFloatComponent {
  protected readonly digits = SITE.features.whatsappFloat.number.replace(/\D/g, '');
}
