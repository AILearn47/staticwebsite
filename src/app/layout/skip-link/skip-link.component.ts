import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-skip-link',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a class="skip-link" href="#main" (click)="skip($event)">{{ 'a11y.skip' | t }}</a>`,
})
export class SkipLinkComponent {
  private readonly doc = inject(DOCUMENT);

  // A bare "#main" href would resolve against <base href="/"> and leave the page.
  protected skip(event: Event): void {
    event.preventDefault();
    this.doc.getElementById('main')?.focus();
  }
}
