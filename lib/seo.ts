// ============================================================
// SEO Helpers (Phase 7.1) — metadata + JSON-LD builders
// ============================================================

import type { Metadata } from 'next';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://startielts.com';

export const siteConfig = {
  name: 'StartIELTS',
  tagline: 'Prepare smarter. Perform better.',
  description:
    'The smart way to prepare for IELTS. Practice all four skills, take realistic mock exams, track your progress, and achieve your target band score.',
  url: SITE_URL,
  ogImage: `${SITE_URL}/logo.svg`,
  keywords: [
    'IELTS',
    'IELTS preparation',
    'IELTS practice',
    'mock exam',
    'band score',
    'IELTS online',
  ],
  locale: 'en_US',
  twitterHandle: '@startielts',
};

/** Per-page metadata with sensible defaults. */
export function createMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || siteConfig.ogImage;
  const fullTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`;

  return {
    title: title ? fullTitle : { default: fullTitle, template: `%s | ${siteConfig.name}` },
    description: description || siteConfig.description,
    keywords: siteConfig.keywords,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: fullTitle,
      description: description || siteConfig.description,
      url,
      siteName: siteConfig.name,
      type: 'website',
      locale: siteConfig.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description || siteConfig.description,
      images: [ogImage],
      creator: siteConfig.twitterHandle,
    },
  };
}

// ============================================================
// JSON-LD Structured Data (Phase 7.5)
// ============================================================

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: SITE_URL,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/practice?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    sameAs: [],
  };
}

export function courseJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'IELTS Preparation Course',
    description: siteConfig.description,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: SITE_URL,
    },
    inLanguage: 'en',
    isAccessibleForFree: true,
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'UZS',
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: '99000',
        priceCurrency: 'UZS',
      },
    ],
  };
}

export function productJsonLd({
  name,
  price,
  description,
}: {
  name: string;
  price: number;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: { '@type': 'Brand', name: siteConfig.name },
    offers: {
      '@type': 'Offer',
      price: String(price),
      priceCurrency: 'UZS',
      availability: 'https://schema.org/InStock',
    },
  };
}

/** Render any JSON-LD object as a script tag payload. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
