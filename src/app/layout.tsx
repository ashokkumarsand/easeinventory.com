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
  alternates: {
    canonical: 'https://easeinventory.com',
    languages: {
      'en-IN': 'https://easeinventory.com/en',
      'pt-BR': 'https://easeinventory.com/pt',
      'ar-SA': 'https://easeinventory.com/ar',
    },
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.png',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              'name': 'EaseInventory',
              'operatingSystem': 'Web',
              'applicationCategory': 'BusinessApplication',
              'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'INR'
              },
              'description': 'Smart Inventory & ERP Solution for modern businesses in India.',
              'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '4.9',
                'ratingCount': '124'
              }
            })
          }}
        />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased bg-background text-foreground min-h-screen transition-colors duration-500`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
