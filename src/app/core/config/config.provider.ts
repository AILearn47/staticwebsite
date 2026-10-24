import { Provider } from '@angular/core';
import { SITE, SITE_CONFIG } from './site-config.token';

export function provideSiteConfig(): Provider {
  return { provide: SITE_CONFIG, useValue: SITE };
}
