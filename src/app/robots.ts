import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/admin/'],
    },
    sitemap: `https://${rootDomain}/sitemap.xml`,
  };
}
