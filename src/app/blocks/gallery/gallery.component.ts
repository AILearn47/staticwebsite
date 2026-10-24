import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { GalleryBlock } from '../../core/content/content.types';

@Component({
  selector: 'app-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block().images?.length) {
      <section class="section">
        <div class="container">
          @if (block().heading) {
            <h2>{{ block().heading }}</h2>
          }
          <div class="grid" data-cols="3">
            @for (img of block().images ?? []; track $index) {
              <figure class="figure">
                <img class="rounded" [src]="img.src" [alt]="img.alt ?? ''" loading="lazy" decoding="async" />
                @if (img.caption) {
                  <figcaption>{{ img.caption }}</figcaption>
                }
              </figure>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class GalleryComponent {
  readonly block = input.required<GalleryBlock>();
}

