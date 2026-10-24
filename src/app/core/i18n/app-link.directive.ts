import { Directive, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { isExternal, localizePath } from './locale';
import { LocaleService } from './locale.service';

/**
 * `<a [appLink]="path">` — locale-prefixes authored paths, renders a real href (crawlable, works
 * without JS) and navigates client-side for internal links. Use this for CMS-authored links.
 */
@Directive({
  selector: 'a[appLink]',
  host: { '[attr.href]': 'href()', '(click)': 'onClick($event)' },
})
export class LinkDirective {
  private readonly router = inject(Router);
  private readonly locale = inject(LocaleService);

  readonly appLink = input<string | undefined>();
  protected readonly href = computed(() => localizePath(this.appLink() || '/', this.locale.locale()));

  protected onClick(e: MouseEvent): void {
    const href = this.href();
    if (isExternal(href) || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    void this.router.navigateByUrl(href);
  }
}
