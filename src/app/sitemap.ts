import { getAllPosts } from '@/lib/blog';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';
  const baseUrl = `https://${rootDomain}`;

  // Static routes
  const staticRoutes = [
    '',
    '/login',
    '/register',
    '/blog',
    '/help',
    '/help/getting-started',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : route.startsWith('/blog') || route.startsWith('/help') ? 0.9 : 0.8,
  }));

  // Dynamic blog posts
  const blogPosts = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogPosts];
}

