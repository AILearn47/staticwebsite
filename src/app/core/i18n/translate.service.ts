import { Injectable, inject } from '@angular/core';
import en from '../../../../i18n/en.json';
import hi from '../../../../i18n/hi.json';
import mr from '../../../../i18n/mr.json';
import { DEFAULT_LOCALE, Locale } from './locale';
import { LocaleService } from './locale.service';

type Dict = { [key: string]: string | Dict };
const DICTS: Record<Locale, Dict> = { en, hi, mr } as Record<Locale, Dict>;

export function lookup(dict: Dict, key: string): string | undefined {
  let cur: string | Dict | undefined = dict;
  for (const part of key.split('.')) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = cur[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly localeService = inject(LocaleService);

  /** UI string for the given (or current) locale; falls back to the default locale, then the key. */
  t(key: string, locale: Locale = this.localeService.locale()): string {
    return lookup(DICTS[locale], key) ?? lookup(DICTS[DEFAULT_LOCALE], key) ?? key;
  }
}
