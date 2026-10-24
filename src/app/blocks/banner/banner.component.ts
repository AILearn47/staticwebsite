import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { BannerBlock } from '../../core/content/content.types';

@Component({
  selector: 'app-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block().text) {
      <div class="container section-tight">
        <p class="banner" [class]="'banner tone-' + (block().tone ?? 'info')" role="note">{{ block().text }}</p>
      </div>
    }
  `,
})
export class BannerComponent {
  readonly block = input.required<BannerBlock>();
}
