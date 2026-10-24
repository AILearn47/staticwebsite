import { Pipe, PipeTransform, inject } from '@angular/core';
import { localizePath } from './locale';
import { LocaleService } from './locale.service';

/** Builds locale-correct hrefs. Every internal link must go through this. */
@Pipe({ name: 'localePath', pure: false })
export class LocalePathPipe implements PipeTransform {
  private readonly locale = inject(LocaleService);

  transform(path: string | undefined | null): string {
    return localizePath(path ?? '/', this.locale.locale());
  }
}
