import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { cookies, headers } from 'next/headers';

import AboutUs from '@/components/landing/AboutUs';
import Blog from '@/components/landing/Blog';
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
import { getAllPosts } from '@/lib/blog';
import PreviewBadge from '@/components/preview/PreviewBadge';
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
  const isRootDomain = host === rootDomain || host === `www.${rootDomain}`;
  const isVercel = host.endsWith('.vercel.app');
  const isLocal = host.includes('localhost') || 
                  host.includes('127.0.0.1') || 
                  host.includes('lvh.me') || 
                  host.includes('nip.io');

  // If we have a custom host or tenant slug but no tenant was found, it must be a 404
  // We exclude root domains, vercel domains, and local environments from this check
  if ((tenantSlug || customHost) && !isRootDomain && !isVercel && !isLocal) {
    const tenantExists = await prisma.tenant.findFirst({
        where: {
          OR: [
            { slug: tenantSlug || '' },
            { customDomain: customHost || '' }
          ]
        }
    });
    if (!tenantExists) {
        const { notFound } = await import('next/navigation');
        notFound();
    }
  }
  
  // Fetch blog posts for landing page
  const blogPosts = getAllPosts().slice(0, 3);

  // Show Coming Soon only on the actual production root domain
  if (isRootDomain && !isLocal) {
    // Check if an admin wants to preview the full site
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.isInternalStaff;

    if (isAdmin) {
      const cookieStore = await cookies();
      const previewCookie = cookieStore.get('ei_preview_mode')?.value === 'true';

      if (previewCookie) {
        // Admin with preview cookie → show full landing
        return (
          <>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Navbar />
            <main id="main-content">
              <Hero />
              <Features />
              <AboutUs />
              <HowItWorks />
              <Pricing />
              <Testimonials />
              <Blog posts={blogPosts} />
              <ContactForm />
              <FAQ />
              <CTA />
            </main>
            <Footer />
            <PreviewBadge isPreviewActive={true} />
          </>
        );
      }

      // Admin without preview cookie → Coming Soon + "Enter Preview" badge
      return (
        <div className="bg-[#030407] min-h-screen">
          <ComingSoon />
          <PreviewBadge isPreviewActive={false} />
        </div>
      );
    }

    // Non-admin → Coming Soon, no badge
    return (
      <div className="bg-[#030407] min-h-screen">
        <ComingSoon />
      </div>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Features />
        <AboutUs />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <Blog posts={blogPosts} />
        <ContactForm />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
