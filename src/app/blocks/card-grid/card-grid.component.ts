import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LinkDirective } from '../../core/i18n/app-link.directive';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import type { CardGridBlock } from '../../core/content/content.types';

const ICONS: Record<string, string> = {
  shield: '🛡️',
  flag: '🚩',
  book: '📖',
  users: '👥',
  heart: '❤️',
  star: '⭐',
  scale: '⚖️',
  hand: '🤝',
  map: '🗺️',
  tree: '🌳',
  school: '🏫',
  megaphone: '📣',
};

@Component({
  selector: 'app-card-grid',
  imports: [LinkDirective, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (block().cards?.length) {
      <section class="section">
        <div class="container">
          @if (block().heading) {
            <h2>{{ block().heading }}</h2>
          }
          <div class="grid" [attr.data-cols]="block().columns ?? 3">
            @for (card of block().cards ?? []; track $index) {
              <article class="card">
                @if (card.icon) {
                  <span class="card-icon" aria-hidden="true">{{ icon(card.icon) }}</span>
                }
                <h3>{{ card.title }}</h3>
                @if (card.text) {
                  <p>{{ card.text }}</p>
                }
                @if (card.path) {
                  <a class="card-link" [appLink]="card.path">{{ 'common.readMore' | t }} →</a>
                }
              </article>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class CardGridComponent {
  readonly block = input.required<CardGridBlock>();
  protected icon(name: string): string {
    return ICONS[name] ?? '★';
  }
}
