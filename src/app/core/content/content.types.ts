import type { Locale } from '../config/site-config';

export interface Cta {
  label: string;
  path: string;
}

export interface HeroBlock {
  type: 'hero';
  heading: string;
  sub?: string;
  image?: string;
  ctas?: Cta[];
}
export interface RichTextBlock {
  type: 'richText';
  markdown: string;
}
export interface CardGridBlock {
  type: 'cardGrid';
  heading?: string;
  columns?: 2 | 3 | 4;
  cards?: { icon?: string; title: string; text?: string; path?: string }[];
}
export interface FaqBlock {
  type: 'faq';
  heading?: string;
  items?: { q: string; a: string }[];
}
export interface StepsBlock {
  type: 'steps';
  heading?: string;
  items?: { title: string; text?: string }[];
}
export interface ImageTextBlock {
  type: 'imageText';
  heading?: string;
  markdown?: string;
  image: string;
  alt?: string;
  imageSide?: 'left' | 'right';
}
export interface GalleryBlock {
  type: 'gallery';
  heading?: string;
  images?: { src: string; alt?: string; caption?: string }[];
}
export interface CtaBlock {
  type: 'cta';
  heading: string;
  text?: string;
  buttonLabel: string;
  path: string;
}
export interface ContactFormBlock {
  type: 'contactForm';
  heading?: string;
  endpoint?: string;
}
export interface BannerBlock {
  type: 'banner';
  text: string;
  tone?: 'info' | 'success' | 'warning';
}
export interface EmbedBlock {
  type: 'embed';
  provider: 'youtube';
  id: string;
  title?: string;
}
export interface TableBlock {
  type: 'table';
  heading?: string;
  columns?: string[];
  rows?: { cells?: string[] }[];
}
export interface StatsBlock {
  type: 'stats';
  heading?: string;
  items?: { value: string; label: string }[];
}
export interface LogoStripBlock {
  type: 'logoStrip';
  heading?: string;
  logos?: { src: string; alt: string; url?: string }[];
}

export type Block =
  | HeroBlock
  | RichTextBlock
  | CardGridBlock
  | FaqBlock
  | StepsBlock
  | ImageTextBlock
  | GalleryBlock
  | CtaBlock
  | ContactFormBlock
  | BannerBlock
  | EmbedBlock
  | TableBlock
  | StatsBlock
  | LogoStripBlock;

export interface PageSeo {
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface Page {
  slug: string;
  locale: Locale;
  title: string;
  seo?: PageSeo;
  translationKey: string;
  updatedAt?: string;
  blocks: Block[];
}

export interface NewsItem {
  slug: string;
  locale: Locale;
  title: string;
  date: string;
  excerpt?: string;
  cover?: string;
  body: string;
  translationKey?: string;
  seo?: PageSeo;
}

export interface Announcement {
  enabled?: boolean;
  text?: string;
  tone?: 'info' | 'success' | 'warning';
  linkLabel?: string;
  path?: string;
}

