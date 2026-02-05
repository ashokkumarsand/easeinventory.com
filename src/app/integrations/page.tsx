'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const liveIntegrations = [
  {
    icon: '💬',
    name: 'WhatsApp Business',
    description: 'Send automated notifications, quotations, and pickup alerts to customers via official WhatsApp Business API.',
    status: 'Live',
    tag: 'Communication',
  },
  {
    icon: '💳',
    name: 'Razorpay',
    description: 'Accept payments via UPI, cards, net banking. Process refunds and manage subscriptions seamlessly.',
    status: 'Live',
    tag: 'Payments',
  },
  {
    icon: '📧',
    name: 'Email (SMTP)',
    description: 'Send invoices, reports, and notifications via email. Works with any SMTP provider.',
    status: 'Live',
    tag: 'Communication',
  },
  {
    icon: '☁️',
    name: 'AWS S3',
    description: 'Secure cloud storage for all your documents, photos, and backups. Indian data residency.',
    status: 'Live',
    tag: 'Storage',
  },
];

const comingSoon = [
  {
    icon: '📚',
    name: 'Tally Integration',
    description: 'Sync invoices and expenses directly with Tally Prime. Two-way data flow.',
    eta: 'Q2 2026',
    tag: 'Accounting',
  },
  {
    icon: '📊',
    name: 'Zoho Books',
    description: 'Connect with Zoho Books for advanced accounting and GST filing.',
    eta: 'Q2 2026',
    tag: 'Accounting',
  },
  {
    icon: '🛒',
    name: 'Shopify',
    description: 'Sync inventory with your Shopify store. Unified online and offline management.',
    eta: 'Q3 2026',
    tag: 'E-commerce',
  },
  {
    icon: '🏪',
    name: 'Amazon Seller',
    description: 'Manage Amazon inventory alongside your physical store stock.',
    eta: 'Q3 2026',
    tag: 'E-commerce',
  },
  {
    icon: '📱',
    name: 'ONDC',
    description: 'Connect to India\'s Open Network for Digital Commerce for wider reach.',
    eta: 'Q4 2026',
    tag: 'E-commerce',
  },
  {
    icon: '🚚',
    name: 'Shiprocket',
    description: 'Automated shipping label generation and tracking for deliveries.',
    eta: 'Q3 2026',
    tag: 'Logistics',
  },
];

const apiFeatures = [
  { icon: '🔌', title: 'REST API', description: 'Full-featured REST API for all operations' },
  { icon: '🔐', title: 'OAuth 2.0', description: 'Secure authentication for your apps' },
  { icon: '🪝', title: 'Webhooks', description: 'Real-time event notifications' },
  { icon: '📖', title: 'Documentation', description: 'Comprehensive API reference' },
];

export default function IntegrationsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] pt-32 pb-20 lg:pt-40 lg:pb-32 flex items-center">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">🔌</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Integrations</span>
              </div>

              <h1 className="heading-lg mb-8">
                Connect Your<br />
                <span className="text-primary italic">Business Stack</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                EaseInventory works with the tools you already use. Connect WhatsApp, payment gateways,
                accounting software, and more—all from one platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Live Integrations */}
        <section className="section-padding relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-3 bg-success/10 border border-success/20 px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-success animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-success">Live Now</span>
              </div>
              <h2 className="heading-lg mb-6">
                Active <span className="text-success italic">Integrations</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {liveIntegrations.map((integration, index) => (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card h-full group hover:border-success/30 transition-all duration-500">
                    <CardContent className="p-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-20 h-20 rounded-[28px] bg-success/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                          {integration.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                          <span className="text-xs font-black text-success">{integration.status}</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-black mb-3 uppercase tracking-tight">{integration.name}</h3>
                      <p className="text-foreground/60 italic mb-4">{integration.description}</p>
                      <div className="bg-foreground/[0.03] px-3 py-1 rounded-full inline-block">
                        <span className="text-xs font-black text-foreground/40">{integration.tag}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="section-padding bg-foreground/[0.02] relative">
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-warning/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-3 bg-warning/10 border border-warning/20 px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-warning animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning">Coming Soon</span>
              </div>
              <h2 className="heading-lg mb-6">
                On The <span className="text-warning italic">Roadmap</span>
              </h2>
              <p className="paragraph-lg">
                Request an integration? Let us know at integrations@easeinventory.com
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {comingSoon.map((integration, index) => (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="modern-card h-full group hover:border-warning/30 transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                          {integration.icon}
                        </div>
                        <span className="text-xs font-black text-warning bg-warning/10 px-3 py-1 rounded-full">{integration.eta}</span>
                      </div>
                      <h3 className="text-lg font-black mb-2 uppercase tracking-tight">{integration.name}</h3>
                      <p className="text-sm text-foreground/60 italic mb-3">{integration.description}</p>
                      <span className="text-xs text-foreground/40">{integration.tag}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* API */}
        <section className="section-padding relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-secondary animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">For Developers</span>
              </div>
              <h2 className="heading-lg mb-6">
                Build with Our <span className="text-secondary italic">API</span>
              </h2>
              <p className="paragraph-lg">
                Need a custom integration? Our API gives you full programmatic access.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
              {apiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card h-full group hover:border-secondary/30 transition-all duration-500">
                    <CardContent className="p-8 text-center">
                      <div className="text-4xl mb-4">{feature.icon}</div>
                      <h3 className="font-black mb-2">{feature.title}</h3>
                      <p className="text-sm text-foreground/60 italic">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button asChild size="lg" className="font-black px-10 h-16 shadow-xl shadow-secondary/30 uppercase tracking-widest rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Link href="/api-docs">
                  View API Documentation
                  <ArrowRight size={20} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="modern-card bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
                <CardContent className="p-12 lg:p-20 text-center relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="text-6xl mb-8">🔗</div>
                    <h2 className="heading-lg mb-6">
                      Request an <span className="text-primary italic">Integration</span>
                    </h2>
                    <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                      Don't see what you need? Tell us and we'll prioritize based on demand.
                    </p>
                    <Button asChild size="lg" className="font-black px-12 h-16 shadow-xl shadow-primary/30 uppercase tracking-widest rounded-full">
                      <Link href="/#contact">
                        Contact Us
                        <ArrowRight size={20} className="ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
