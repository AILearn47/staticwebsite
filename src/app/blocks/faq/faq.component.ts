import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { FaqBlock } from '../../core/content/content.types';

@Component({
  selector: 'app-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block().items?.length) {
      <section class="section">
        <div class="container narrow">
          @if (block().heading) {
            <h2>{{ block().heading }}</h2>
          }
          @for (item of block().items ?? []; track $index) {
            <details class="faq-item">
              <summary>{{ item.q }}</summary>
              <p>{{ item.a }}</p>
            </details>
          }
        </div>
      </section>
    }
  `,
})
export class FaqComponent {
  readonly block = input.required<FaqBlock>();
}

