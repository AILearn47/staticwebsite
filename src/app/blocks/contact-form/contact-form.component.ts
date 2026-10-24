import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { SITE } from '../../core/config/site-config.token';
import type { ContactFormBlock } from '../../core/content/content.types';
import { LocaleService } from '../../core/i18n/locale.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-contact-form',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (enabled) {
      <section class="section">
        <div class="container narrow">
          @if (block().heading) {
            <h2>{{ block().heading }}</h2>
          }
          <form class="form" (submit)="submit($event)">
            <label>
              {{ 'form.name' | t }}
              <input name="name" type="text" autocomplete="name" required maxlength="100" />
            </label>
            <label>
              {{ 'form.email' | t }}
              <input name="email" type="email" autocomplete="email" required maxlength="200" />
            </label>
            <label>
              {{ 'form.message' | t }}
              <textarea name="message" rows="5" required minlength="10" maxlength="3000"></textarea>
            </label>
            <!-- Honeypot: hidden from people, filled by bots. -->
            <div class="hp" aria-hidden="true">
              <label>Website <input name="website" type="text" tabindex="-1" autocomplete="off" /></label>
            </div>
            <button class="btn btn-primary" type="submit" [disabled]="status() === 'sending'">
              {{ (status() === 'sending' ? 'form.sending' : 'form.send') | t }}
            </button>
            <p role="status" aria-live="polite" class="form-status" [class.ok]="status() === 'ok'" [class.err]="status() === 'error'">
              @switch (status()) {
                @case ('ok') { {{ 'form.success' | t }} }
                @case ('error') { {{ 'form.error' | t }} }
              }
            </p>
          </form>
        </div>
      </section>
    }
  `,
})
export class ContactFormComponent {
  readonly block = input.required<ContactFormBlock>();
  private readonly locale = inject(LocaleService);
  protected readonly enabled = SITE.features.contactForm;
  protected readonly status = signal<'idle' | 'sending' | 'ok' | 'error'>('idle');

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());
    this.status.set('sending');
    try {
      const res = await fetch(this.block().endpoint || SITE.contact.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale: this.locale.locale() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      this.status.set('ok');
    } catch {
      this.status.set('error');
    }
  }
}
