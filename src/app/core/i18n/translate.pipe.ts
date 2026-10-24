import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from './translate.service';

// Impure so it re-evaluates when the locale signal changes.
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(key: string): string {
    return this.translate.t(key);
  }
}
