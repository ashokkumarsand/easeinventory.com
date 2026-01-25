import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'EaseInventory - Smart Inventory Management for Modern Businesses',
    template: '%s | EaseInventory',
  },
  description:
    'Manage your inventory, repairs, invoicing, and team operations with EaseInventory. Get your own subdomain, custom branding, and powerful features. Made in India, for India.',
  keywords: [
    'inventory management',
    'stock management',
    'repair tracking',
    'invoicing software',
    'Indian business software',
    'GST invoicing',
    'multi-tenant SaaS',
    'shop management',
  ],
  authors: [{ name: 'EaseInventory Team' }],
  creator: 'EaseInventory',
  publisher: 'EaseInventory',
  metadataBase: new URL('https://easeinventory.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://easeinventory.com',
    siteName: 'EaseInventory',
    title: 'EaseInventory - Smart Inventory Management',
    description: 'Manage inventory, track repairs, generate invoices. Start free today!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EaseInventory - Smart Inventory Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EaseInventory - Smart Inventory Management',
    description: 'Manage inventory, track repairs, generate invoices. Start free today!',
    images: ['/og-image.png'],
    creator: '@easeinventory',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans antialiased bg-cream text-dark min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
