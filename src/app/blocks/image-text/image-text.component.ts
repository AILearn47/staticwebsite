import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ImageTextBlock } from '../../core/content/content.types';
import { renderMarkdown } from '../../core/content/markdown';

@Component({
  selector: 'app-image-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block().image) {
      <section class="section">
        <div class="container split" [class.reverse]="block().imageSide === 'left'">
          <div class="prose">
            @if (block().heading) {
              <h2>{{ block().heading }}</h2>
            }
            <div [innerHTML]="html()"></div>
          </div>
          <img class="rounded" [src]="block().image" [alt]="block().alt ?? ''" loading="lazy" decoding="async" />
        </div>
      </section>
    }
  `,
})
export class ImageTextComponent {
  readonly block = input.required<ImageTextBlock>();
  protected readonly html = computed(() => renderMarkdown(this.block().markdown));
}
