import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { PageContextService } from '../../core/seo/page-context.service';

@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ctx.breadcrumbs().length > 1) {
      <nav class="breadcrumbs container" [attr.aria-label]="'a11y.breadcrumbs' | t">
        <ol>
          @for (c of ctx.breadcrumbs(); track c.path; let last = $last) {
            <li>
              @if (last) {
                <span aria-current="page">{{ c.label }}</span>
              } @else {
                <a [routerLink]="c.path">{{ c.label }}</a>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
})
export class BreadcrumbsComponent {
  protected readonly ctx = inject(PageContextService);
}
