import type { Metadata } from 'next';
import { headers } from 'next/headers';

import ComingSoon from '@/components/landing/ComingSoon';
import ContactForm from '@/components/landing/ContactForm';
import CTA from '@/components/landing/CTA';
import FAQ from '@/components/landing/FAQ';
import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Navbar from '@/components/landing/Navbar';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';

export const metadata: Metadata = {
  title: 'EaseInventory - Smart Inventory Management for Modern Businesses',
  description:
    'Manage your inventory, repairs, invoicing, and team operations with EaseInventory. Get your own subdomain, custom branding, and powerful features. Made in India, for India. Track stock with serial numbers, generate GST invoices, manage repair tickets with WhatsApp notifications.',
  keywords: [
    'inventory management software',
    'inventory management system',
    'stock management software india',
    'repair tracking software',
    'GST invoicing software',
    'shop management software',
    'multi-tenant SaaS',
    'business management software',
    'inventory tracking',
    'serial number tracking',
    'repair ticket system',
    'WhatsApp notifications business',
    'HR attendance software',
    'employee management india',
    'small business software india',
    'retail inventory management',
    'electronics shop management',
    'mobile shop software',
    'service center software',
    'cloud inventory software',
  ],
  authors: [{ name: 'EaseInventory' }],
  openGraph: {
    title: 'EaseInventory - Smart Inventory Management for Indian Businesses',
    description: 'Manage inventory, track repairs, generate GST invoices. Get your own subdomain. Start free today!',
    url: 'https://easeinventory.com',
    siteName: 'EaseInventory',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EaseInventory - Smart Inventory Management',
    description: 'Manage inventory, track repairs, generate invoices. Start free today!',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://easeinventory.com',
  },
};

// Structured data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'EaseInventory',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  description: 'Smart inventory management software for Indian businesses with repair tracking, GST invoicing, and HR management.',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
  },
};

export default async function HomePage() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Check if we're on the production domain
  const isProduction = host.includes('easeinventory.com');
  
  // Show coming soon on production, full landing page on localhost
  if (isProduction) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ComingSoon />
      </>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <ContactForm />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
