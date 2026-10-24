import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Locale, localeFromUrl } from './locale';

/** Current locale, kept in sync with the URL. */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly router = inject(Router);
  readonly locale = signal<Locale>(localeFromUrl(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.locale.set(localeFromUrl(e.urlAfterRedirects)));
  }
}
