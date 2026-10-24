import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LinkDirective } from '../../core/i18n/app-link.directive';
import type { CtaBlock } from '../../core/content/content.types';

@Component({
  selector: 'app-cta',
  imports: [LinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block().heading) {
      <section class="section">
        <div class="container">
          <div class="cta-band">
            <h2>{{ block().heading }}</h2>
            @if (block().text) {
              <p>{{ block().text }}</p>
            }
            @if (block().buttonLabel) {
              <a class="btn btn-accent" [appLink]="block().path">{{ block().buttonLabel }}</a>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class CtaComponent {
  readonly block = input.required<CtaBlock>();
}
