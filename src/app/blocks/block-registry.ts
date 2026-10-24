import type { Type } from '@angular/core';
import { SITE_BLOCKS } from '../site-blocks';
import { BannerComponent } from './banner/banner.component';
import { CardGridComponent } from './card-grid/card-grid.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { CtaComponent } from './cta/cta.component';
import { EmbedComponent } from './embed/embed.component';
import { FaqComponent } from './faq/faq.component';
import { GalleryComponent } from './gallery/gallery.component';
import { HeroComponent } from './hero/hero.component';
import { ImageTextComponent } from './image-text/image-text.component';
import { LogoStripComponent } from './logo-strip/logo-strip.component';
import { RichTextComponent } from './rich-text/rich-text.component';
import { StatsComponent } from './stats/stats.component';
import { StepsComponent } from './steps/steps.component';
import { TableComponent } from './table/table.component';

export const BLOCK_REGISTRY: Record<string, Type<unknown>> = {
  hero: HeroComponent,
  richText: RichTextComponent,
  cardGrid: CardGridComponent,
  faq: FaqComponent,
  steps: StepsComponent,
  imageText: ImageTextComponent,
  gallery: GalleryComponent,
  cta: CtaComponent,
  contactForm: ContactFormComponent,
  banner: BannerComponent,
  embed: EmbedComponent,
  table: TableComponent,
  stats: StatsComponent,
  logoStrip: LogoStripComponent,
  ...SITE_BLOCKS,
};
