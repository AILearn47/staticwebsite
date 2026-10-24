import { InjectionToken } from '@angular/core';
import raw from '../../../../site.config.json';
import type { SiteConfig } from './site-config';

/** The config, imported at build time. Also usable outside DI (server routes, pure helpers). */
export const SITE = raw as unknown as SiteConfig;

export const SITE_CONFIG = new InjectionToken<SiteConfig>('SITE_CONFIG');
