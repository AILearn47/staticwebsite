import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { StatsBlock } from '../../core/content/content.types';

@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block().items?.length) {
      <section class="section alt">
        <div class="container">
          @if (block().heading) {
            <h2>{{ block().heading }}</h2>
          }
          <dl class="stats">
            @for (s of block().items ?? []; track $index) {
              <div class="stat">
                <dt>{{ s.label }}</dt>
                <dd>{{ s.value }}</dd>
              </div>
            }
          </dl>
        </div>
      </section>
    }
  `,
})
export class StatsComponent {
  readonly block = input.required<StatsBlock>();
}

