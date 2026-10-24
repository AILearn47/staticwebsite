import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { StepsBlock } from '../../core/content/content.types';

@Component({
  selector: 'app-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block().items?.length) {
      <section class="section alt">
        <div class="container narrow">
          @if (block().heading) {
            <h2>{{ block().heading }}</h2>
          }
          <ol class="steps">
            @for (s of block().items ?? []; track $index) {
              <li>
                <h3>{{ s.title }}</h3>
                @if (s.text) {
                  <p>{{ s.text }}</p>
                }
              </li>
            }
          </ol>
        </div>
      </section>
    }
  `,
})
export class StepsComponent {
  readonly block = input.required<StepsBlock>();
}

