import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { LogoStripBlock } from '../../core/content/content.types';

@Component({
  selector: 'app-logo-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block().logos?.length) {
      <section class="section">
        <div class="container">
          @if (block().heading) {
            <h2>{{ block().heading }}</h2>
          }
          <ul class="logos">
            @for (l of block().logos ?? []; track $index) {
              <li>
                @if (l.url) {
                  <a [href]="l.url" rel="noopener"><img [src]="l.src" [alt]="l.alt" loading="lazy" /></a>
                } @else {
                  <img [src]="l.src" [alt]="l.alt" loading="lazy" />
                }
              </li>
            }
          </ul>
        </div>
      </section>
    }
  `,
})
export class LogoStripComponent {
  readonly block = input.required<LogoStripBlock>();
}

