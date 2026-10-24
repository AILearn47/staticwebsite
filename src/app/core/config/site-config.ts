export type Locale = 'en' | 'hi' | 'mr';
export type LocalizedText = Record<Locale, string>;

export interface NavItem {
  key: string;
  path: string;
}

export interface SiteConfig {
  siteId: string;
  name: LocalizedText;
  tagline: LocalizedText;
  domain: string;
  i18n: {
    defaultLocale: Locale;
    locales: Locale[];
    localeNames: Record<Locale, string>;
    pathPrefix: Record<Locale, string>;
    hreflangRegion: Record<Locale, string>;
    fallbackToDefault: boolean;
  };
  brand: {
    logo: { light: string; dark: string };
    favicon: string;
    ogImage: string;
  };
  theme: {
    preset: string;
    colors: Record<string, string>;
    colorsDark?: Record<string, string>;
    fonts: { heading: string; body: string; indic: string };
    radius: string;
    density: string;
    darkMode: 'auto' | 'light' | 'dark';
  };
  navigation: {
    header: NavItem[];
    footer: NavItem[];
    cta: NavItem;
  };
  features: {
    blog: boolean;
    faq: boolean;
    contactForm: boolean;
    languageSwitcher: boolean;
    adSlot: boolean;
    whatsappFloat: { enabled: boolean; number: string };
  };
  seo: {
    titleTemplate: string;
    defaultDescription: LocalizedText;
    organization: { name: string; type: string; sameAs: string[] };
    verification: { google: string; bing: string };
  };
  contact: {
    email: string;
    phone: string;
    address: { locality: string; region: string; country: string };
    formEndpoint: string;
  };
  analytics: { ga4: string; plausible: string };
  legal: { disclaimer: LocalizedText };
}
