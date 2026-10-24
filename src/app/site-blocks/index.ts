import type { Type } from '@angular/core';

/**
 * Per-site custom blocks live here (empty in the template). Map a block `type` to a standalone
 * component with a `block` input, then add the matching widget to public/admin/config.yml.
 */
export const SITE_BLOCKS: Record<string, Type<unknown>> = {};
