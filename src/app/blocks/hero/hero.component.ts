import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LinkDirective } from '../../core/i18n/app-link.directive';
import type { HeroBlock } from '../../core/content/content.types';

@Component({
  selector: 'app-hero',
  imports: [LinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div class="container hero-inner" [class.with-image]="block().image">
        <div class="hero-copy">
          <h1>{{ block().heading }}</h1>
          @if (block().sub) {
            <p class="lead">{{ block().sub }}</p>
          }
          @if (block().ctas?.length) {
            <div class="actions">
              @for (c of block().ctas ?? []; track $index) {
                <a class="btn" [class.btn-accent]="$first" [class.btn-ghost]="!$first" [appLink]="c.path">{{ c.label }}</a>
              }
            </div>
          }
        </div>
        @if (block().image) {
          <img class="hero-image" [src]="block().image" alt="" fetchpriority="high" decoding="async" />
        }
      </div>
    </section>
  `,
})
export class HeroComponent {
  readonly block = input.required<HeroBlock>();
}
