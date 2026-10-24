import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { RichTextBlock } from '../../core/content/content.types';
import { renderMarkdown } from '../../core/content/markdown';

@Component({
  selector: 'app-rich-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (html()) {
      <section class="section">
        <div class="container prose" [innerHTML]="html()"></div>
      </section>
    }
  `,
})
export class RichTextComponent {
  readonly block = input.required<RichTextBlock>();
  protected readonly html = computed(() => renderMarkdown(this.block().markdown));
}
