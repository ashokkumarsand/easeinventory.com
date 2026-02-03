import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subdomain Hosting & Custom Branding | Your Business URL | EaseInventory',
  description: 'Get your own yourstore.easeinventory.com URL with custom logo, colors, and branding. Free SSL, custom domain support, and white-label options.',
  keywords: ['subdomain hosting', 'custom business URL', 'white-label retail software', 'branded retail platform', 'custom domain India'],
  openGraph: {
    title: 'Subdomain & Custom Branding | EaseInventory',
    description: 'Your own branded storefront URL with custom logo and colors.',
    type: 'website',
  },
};

export default function SubdomainLayout({ children }: { children: React.ReactNode }) {
  return children;
}
