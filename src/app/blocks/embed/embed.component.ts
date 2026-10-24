import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import type { EmbedBlock } from '../../core/content/content.types';

@Component({
  selector: 'app-embed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src(); as url) {
      <section class="section">
        <div class="container narrow">
          <div class="video">
            <iframe
              [src]="url"
              [title]="block().title || 'Video'"
              loading="lazy"
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </section>
    }
  `,
})
export class EmbedComponent {
  readonly block = input.required<EmbedBlock>();
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly src = computed<SafeResourceUrl | null>(() => {
    const { provider, id } = this.block();
    // Only a validated YouTube id ever reaches the URL.
    if (provider !== 'youtube' || !/^[\w-]{6,20}$/.test(id ?? '')) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}`);
  });
}
