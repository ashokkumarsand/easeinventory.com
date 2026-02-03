'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const releases = [
  {
    version: '2.5.0',
    date: 'Feb 1, 2026',
    tag: 'Latest',
    highlights: [
      { type: 'feature', text: 'Multi-location inventory transfers with approval workflow' },
      { type: 'feature', text: 'Advanced repair analytics dashboard' },
      { type: 'improvement', text: 'WhatsApp notification templates now customizable' },
      { type: 'fix', text: 'Fixed invoice PDF generation for large orders' },
    ],
  },
  {
    version: '2.4.0',
    date: 'Jan 15, 2026',
    tag: 'Major',
    highlights: [
      { type: 'feature', text: 'Staff attendance with geo-location tracking' },
      { type: 'feature', text: 'Automated payroll calculation' },
      { type: 'improvement', text: 'Dashboard load time reduced by 40%' },
      { type: 'fix', text: 'Credit balance calculation in multi-currency' },
    ],
  },
  {
    version: '2.3.0',
    date: 'Dec 20, 2025',
    tag: 'Feature',
    highlights: [
      { type: 'feature', text: 'WhatsApp Business API integration' },
      { type: 'feature', text: 'Customer quotation approval via link' },
      { type: 'improvement', text: 'Barcode scanner now works offline' },
      { type: 'fix', text: 'Stock sync issue with parallel sales' },
    ],
  },
  {
    version: '2.2.0',
    date: 'Nov 30, 2025',
    tag: 'Feature',
    highlights: [
      { type: 'feature', text: 'Batch and expiry tracking for products' },
      { type: 'feature', text: 'FIFO/FEFO stock allocation' },
      { type: 'improvement', text: 'Product search now includes SKU matching' },
      { type: 'fix', text: 'Report export timeout for large datasets' },
    ],
  },
  {
    version: '2.1.0',
    date: 'Nov 10, 2025',
    tag: 'Feature',
    highlights: [
      { type: 'feature', text: 'Custom subdomain branding' },
      { type: 'feature', text: 'Logo and color customization' },
      { type: 'improvement', text: 'Mobile app performance optimizations' },
      { type: 'fix', text: 'Invoice numbering sequence reset issue' },
    ],
  },
  {
    version: '2.0.0',
    date: 'Oct 15, 2025',
    tag: 'Major',
    highlights: [
      { type: 'feature', text: 'Complete UI redesign with Antigravity theme' },
      { type: 'feature', text: 'Dark mode support across all pages' },
      { type: 'feature', text: 'Real-time collaborative editing' },
      { type: 'improvement', text: 'New onboarding flow for first-time users' },
    ],
  },
];

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'feature':
      return { bg: 'bg-success/10', text: 'text-success', label: 'New' };
    case 'improvement':
      return { bg: 'bg-primary/10', text: 'text-primary', label: 'Improved' };
    case 'fix':
      return { bg: 'bg-warning/10', text: 'text-warning', label: 'Fixed' };
    default:
      return { bg: 'bg-foreground/10', text: 'text-foreground', label: type };
  }
};

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">📝</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Changelog</span>
              </div>

              <h1 className="heading-lg mb-8">
                What's <span className="text-primary italic">New</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                Track every improvement we make to EaseInventory. New features, bug fixes,
                and performance enhancements—all documented here.
              </p>

              <Button as={Link} href="/register" color="primary" size="lg" className="font-black px-10 h-16 shadow-xl shadow-primary/30 uppercase tracking-widest" radius="full">
                Try Latest Version
                <ArrowRight size={20} />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Releases */}
        <section className="section-padding relative">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto space-y-8">
              {releases.map((release, index) => (
                <motion.div
                  key={release.version}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card overflow-hidden">
                    <CardBody className="p-0">
                      {/* Header */}
                      <div className="p-8 border-b border-foreground/5 flex flex-wrap items-center gap-4">
                        <h2 className="text-3xl font-black">v{release.version}</h2>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-foreground/40">{release.date}</span>
                          {release.tag === 'Latest' && (
                            <span className="bg-success text-white text-xs font-black px-3 py-1 rounded-full">
                              {release.tag}
                            </span>
                          )}
                          {release.tag === 'Major' && (
                            <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded-full">
                              {release.tag}
                            </span>
                          )}
                          {release.tag === 'Feature' && (
                            <span className="bg-secondary text-white text-xs font-black px-3 py-1 rounded-full">
                              {release.tag}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Changes */}
                      <div className="p-8 space-y-4">
                        {release.highlights.map((item, i) => {
                          const styles = getTypeStyles(item.type);
                          return (
                            <div key={i} className="flex items-start gap-4">
                              <span className={`${styles.bg} ${styles.text} text-xs font-black px-3 py-1 rounded-full shrink-0`}>
                                {styles.label}
                              </span>
                              <p className="text-foreground/70 leading-relaxed">{item.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button variant="bordered" size="lg" className="font-black px-10 h-14 uppercase tracking-widest border-foreground/10" radius="full">
                Load Older Releases
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Subscribe */}
        <section className="section-padding relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="modern-card bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border-secondary/20 overflow-hidden">
                <CardBody className="p-12 lg:p-20 text-center relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="text-6xl mb-8">📬</div>
                    <h2 className="heading-lg mb-6">
                      Stay <span className="text-secondary italic">Updated</span>
                    </h2>
                    <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                      Get notified about major updates and new features via email.
                    </p>
                    <Button as={Link} href="/#contact" color="secondary" size="lg" className="font-black px-12 h-16 shadow-xl shadow-secondary/30 uppercase tracking-widest" radius="full">
                      Subscribe to Updates
                      <ArrowRight size={20} />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
