import prisma from '@/lib/prisma';
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
import PublicTenantPage from '@/components/public/PublicTenantPage';

export const metadata: Metadata = {
  title: 'EaseInventory | All-in-One ERP & Smart Inventory Management System',
  description:
    'The ultimate shop management and ERP solution for modern businesses. Streamline inventory, repair tracking, GST billing, and team operations with EaseInventory. Built for retailers, distributors, and service centers.',
  keywords: ['ERP solution', 'inventory management software', 'shop management system', 'GST billing software', 'repair tracking system', 'multi-tenant inventory'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EaseInventory | Smart Inventory & ERP Solution',
    description: 'Transform your business operations with our integrated ERP and inventory management platform.',
    images: ['/og-image.png'],
  }
};

export default async function HomePage() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const tenantSlug = headersList.get('x-tenant-slug');
  const customHost = headersList.get('x-tenant-host');
  
  // 1. Resolve Tenant for White-labeling/Subdomains
  if (tenantSlug || customHost) {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: tenantSlug || '' },
          { customDomain: customHost || '' }
        ]
      }
    });

    if (tenant) {
      return <PublicTenantPage tenant={tenant as any} />;
    }
  }

  // 2. Main Site Logic
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';
  const isProduction = host.includes(rootDomain) && !host.includes('localhost');
  
  if (isProduction) {
    return (
      <div className="bg-[#030407] min-h-screen">
        <ComingSoon />
      </div>
    );
  }

  return (
    <>
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
