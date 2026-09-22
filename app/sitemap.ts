import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const publicPages: Array<{
    path: string;
    changeFrequency: 'weekly' | 'monthly' | 'yearly';
    priority: number;
  }> = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/practice', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/mock-exam', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/vocabulary', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/signup', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/signin', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

  return publicPages.map(page => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
