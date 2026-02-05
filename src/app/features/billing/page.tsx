'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { value: '<5s', label: 'Invoice Generation', icon: '⚡' },
  { value: '100%', label: 'GST Compliant', icon: '✅' },
  { value: '10K+', label: 'HSN Codes', icon: '📋' },
  { value: '₹0', label: 'Filing Penalties', icon: '🛡️' },
];

const coreFeatures = [
  {
    icon: '📄',
    title: 'Smart GST Invoicing',
    tag: 'Compliance',
    description: 'Generate 100% GST-compliant invoices with automatic CGST, SGST, and IGST calculations.',
    highlights: ['Auto tax calculation', 'B2B & B2C formats', 'Credit/Debit notes', 'Reverse charge'],
  },
  {
    icon: '🏷️',
    title: 'HSN Code Management',
    tag: 'Database',
    description: 'Built-in HSN code database with over 10,000 codes. Auto-suggest based on product name.',
    highlights: ['10,000+ HSN codes', 'Smart suggestions', 'Category mapping', 'SAC for services'],
  },
  {
    icon: '🖨️',
    title: 'Multi-Format Printing',
    tag: 'Flexible',
    description: 'Print on thermal printers (58mm, 80mm), A4, A5, or generate PDF for email/WhatsApp.',
    highlights: ['Thermal 58mm/80mm', 'A4/A5/Letter', 'PDF generation', 'Custom templates'],
  },
  {
    icon: '🌐',
    title: 'E-Invoicing Ready',
    tag: 'Digital',
    description: 'For businesses above ₹5 crore, generate e-invoices compliant with NIC portal.',
    highlights: ['NIC integrated', 'Auto IRN generation', 'QR on invoice', 'E-way bill linking'],
  },
];

const howItWorks = [
  { step: '01', title: 'Add Products', description: 'Scan barcode or search products to add to invoice with automatic pricing.', icon: '🛒' },
  { step: '02', title: 'Apply Taxes', description: 'GST calculated automatically based on HSN codes and customer location.', icon: '🧮' },
  { step: '03', title: 'Print & Share', description: 'Print on thermal/A4 or share PDF via WhatsApp with payment link.', icon: '📤' },
];

const additionalFeatures = [
  { icon: '💳', title: 'Digital Payments', description: 'Accept UPI, cards, wallets. Payment links via WhatsApp.' },
  { icon: '📥', title: 'GSTR-1 Export', description: 'One-click export in government format for filing.' },
  { icon: '🔄', title: 'Recurring Invoices', description: 'Auto-generate monthly invoices for subscriptions.' },
  { icon: '💬', title: 'WhatsApp Invoices', description: 'Send invoice PDF directly via WhatsApp with one click.' },
  { icon: '📱', title: 'UPI QR on Invoice', description: 'Dynamic UPI QR code for instant payment collection.' },
  { icon: '📝', title: 'Audit Trail', description: 'Complete history of every invoice for GST audits.' },
];

const faqs = [
  { q: 'Is EaseInventory compliant with GST rules?', a: 'Yes, 100%. Our invoices follow all GST format requirements including mandatory fields, tax breakup, and HSN/SAC codes.' },
  { q: 'Can I generate e-invoices for government portal?', a: 'Yes. If your turnover exceeds ₹5 crore, you can generate e-invoices directly with IRN and QR code.' },
  { q: 'How do I export data for GSTR-1 filing?', a: 'Go to Reports → GST Reports → GSTR-1. Select the month and click Export for a ready-to-upload JSON file.' },
  { q: 'Can I use thermal printers for billing?', a: 'Yes! Works with any thermal printer (58mm or 80mm). Just connect via USB or Bluetooth and print.' },
];

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] pt-32 pb-20 lg:pt-40 lg:pb-32 flex items-center">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-success/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 bg-success/10 border border-success/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">📄</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-success">Instant GST Bills</span>
              </div>

              <h1 className="heading-lg mb-8">
                GST Billing in<br />
                <span className="text-success italic">Under 5 Seconds.</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-xl">
                Generate 100% compliant GST invoices instantly. HSN codes, tax calculations,
                e-invoicing, thermal printing, and GSTR-1 export—all automated.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button asChild className="font-black px-10 h-16 shadow-xl shadow-success/30 uppercase tracking-widest rounded-full bg-success text-success-foreground hover:bg-success/90">
                  <Link href="/register">
                    Start Free Trial
                    <ArrowRight size={20} />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="font-black px-10 h-16 uppercase tracking-widest border-foreground/10 rounded-full">
                  <Link href="#features">
                    Explore
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-8">
                {['E-invoicing ready', 'GSTR-1 export', 'Thermal printing'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                      <Check size={12} className="text-success" />
                    </div>
                    <span className="text-sm font-bold text-foreground/60">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-5"
            >
              {stats.map((stat) => (
                <Card key={stat.label} className="modern-card group hover:scale-105 transition-transform duration-500">
                  <CardContent className="p-8">
                    <div className="text-4xl mb-4">{stat.icon}</div>
                    <div className="text-4xl font-black text-success mb-2">{stat.value}</div>
                    <div className="text-sm font-bold text-foreground/50">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="section-padding relative">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-success/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-success/10 border border-success/20 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-success animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-success">Core Features</span>
            </div>
            <h2 className="heading-lg mb-6">
              Complete GST <span className="text-success italic">Billing</span> Solution
            </h2>
            <p className="paragraph-lg">
              Everything you need to bill customers, stay compliant, and file returns on time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="modern-card h-full group hover:border-success/30 transition-all duration-500">
                  <CardContent className="p-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-20 h-20 rounded-[28px] bg-success/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                        {feature.icon}
                      </div>
                      <div className="bg-foreground/[0.03] dark:bg-white/5 px-4 py-1.5 rounded-full">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{feature.tag}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black mb-4 group-hover:text-success transition-colors uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-foreground/60 leading-relaxed mb-6 italic">{feature.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.highlights.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-success" />
                          <span className="text-sm text-foreground/70">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-foreground/[0.02] relative">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-secondary animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">How It Works</span>
            </div>
            <h2 className="heading-lg mb-6">
              Create Invoices in <span className="text-secondary italic">3 Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center text-5xl mx-auto">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-black text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-foreground/60 italic">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="section-padding relative">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-warning/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-warning/10 border border-warning/20 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-warning animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning">Advanced</span>
            </div>
            <h2 className="heading-lg mb-6">
              Beyond <span className="text-warning italic">Basic</span> Invoicing
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="modern-card h-full group hover:border-warning/30 transition-all duration-500">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-black mb-3 uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-foreground/60 italic">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-foreground/[0.02] relative">
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-foreground/5 border border-foreground/10 px-4 py-2 rounded-full mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50">FAQs</span>
            </div>
            <h2 className="heading-lg">
              Questions? <span className="text-success italic">Answered.</span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="modern-card">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-black mb-3">{faq.q}</h3>
                    <p className="text-foreground/60 italic leading-relaxed">{faq.a}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-success/5 to-transparent pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="modern-card bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20 overflow-hidden">
              <CardContent className="p-12 lg:p-20 text-center relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-6xl mb-8">📄</div>
                  <h2 className="heading-lg mb-6">
                    Simplify Your <span className="text-success italic">GST Billing</span> Today
                  </h2>
                  <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                    Join thousands of Indian retailers who bill faster and file with confidence.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild className="font-black px-12 h-16 shadow-xl shadow-success/30 uppercase tracking-widest rounded-full bg-success text-success-foreground hover:bg-success/90">
                      <Link href="/register">
                        Start Free Trial
                        <ArrowRight size={20} />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="font-black px-12 h-16 uppercase tracking-widest border-foreground/10 rounded-full">
                      <Link href="/#contact">
                        Talk to Sales
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
