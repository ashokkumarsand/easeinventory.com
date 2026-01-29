import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';
  const baseUrl = `https://${rootDomain}`;

  const routes = [
    '',
    '/login',
    '/register',
    '/forgot-password',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes];
}
