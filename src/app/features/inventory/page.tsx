'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { value: '99.9%', label: 'Inventory Accuracy', icon: '🎯' },
  { value: '50%', label: 'Time Saved', icon: '⚡' },
  { value: '<2s', label: 'Search Speed', icon: '🔍' },
  { value: '₹0', label: 'Stockout Losses', icon: '📈' },
];

const coreFeatures = [
  {
    icon: '📱',
    title: 'Barcode & QR Scanning',
    tag: 'Mobile',
    description: 'Scan products instantly using your phone camera. Supports EAN-13, UPC, Code-128, and QR codes.',
    highlights: ['Camera-based scanning', '7+ barcode formats', 'Print custom labels', 'Bulk generation'],
  },
  {
    icon: '🔢',
    title: 'Serial Number Tracking',
    tag: 'Precision',
    description: 'Track individual units with unique serial numbers. Perfect for electronics and high-value items.',
    highlights: ['Unique unit IDs', 'Warranty tracking', 'History per unit', 'Recall management'],
  },
  {
    icon: '📍',
    title: 'Multi-Location Management',
    tag: 'Scale',
    description: 'Manage inventory across multiple stores and warehouses. Transfer stock with full audit trails.',
    highlights: ['Unlimited locations', 'Inter-location transfers', 'Location-wise reports', 'Centralized view'],
  },
  {
    icon: '💰',
    title: 'Automated Profit Analysis',
    tag: 'Insights',
    description: 'Know your margins instantly. Automatic calculation of cost, sale price, and profit percentage.',
    highlights: ['Real-time tracking', 'Margin alerts', 'Cost history', 'Pricing suggestions'],
  },
];

const howItWorks = [
  { step: '01', title: 'Import Products', description: 'Upload existing inventory via Excel or add products manually with our guided wizard.', icon: '📤' },
  { step: '02', title: 'Configure Locations', description: 'Set up stores, warehouses, and define minimum stock levels for each product.', icon: '⚙️' },
  { step: '03', title: 'Start Tracking', description: 'Scan barcodes, record purchases, process sales. Every movement tracked in real-time.', icon: '🚀' },
];

const additionalFeatures = [
  { icon: '📅', title: 'Batch & Expiry Tracking', description: 'Track batch numbers and expiry dates with FIFO/FEFO alerts.' },
  { icon: '📊', title: 'Stock Movement History', description: 'Complete audit trail of every stock movement with user details.' },
  { icon: '🔔', title: 'Low Stock Alerts', description: 'Automated alerts when inventory falls below minimum levels.' },
  { icon: '📈', title: 'Inventory Analytics', description: 'Identify slow-moving items, fast sellers, and dead stock.' },
  { icon: '🤝', title: 'Consignment Support', description: 'Track consignment inventory with supplier settlement tracking.' },
  { icon: '💡', title: 'Reorder Suggestions', description: 'Smart suggestions based on sales velocity and lead times.' },
];

const faqs = [
  { q: 'Can I import my existing inventory from Excel?', a: 'Yes! EaseInventory supports bulk import from Excel and CSV files. Our guided import wizard maps your columns automatically.' },
  { q: 'How does serial number tracking work?', a: 'When you receive stock, assign unique serial numbers to each unit. These are tracked through sales, repairs, and returns.' },
  { q: 'Can I manage multiple stores from one account?', a: 'Absolutely. Add unlimited locations and track inventory at each. Transfer stock between locations with full documentation.' },
  { q: 'Do I need special hardware for barcode scanning?', a: 'No! EaseInventory uses your phone or tablet camera. You can also use traditional USB barcode scanners if you prefer.' },
];

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] pt-32 pb-20 lg:pt-40 lg:pb-32 flex items-center">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">📦</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Precision Inventory</span>
              </div>

              <h1 className="heading-lg mb-8">
                Know Your Stock.<br />
                <span className="text-primary italic">Down to the Last Unit.</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-xl">
                Complete visibility into your stock. Track every item with serial numbers, scan barcodes
                with your phone, get low-stock alerts, and analyze profitability in real-time.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button asChild className="font-black px-10 h-16 shadow-xl shadow-primary/30 uppercase tracking-widest rounded-full">
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
                {['No credit card', '5 min setup', 'Free import'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check size={12} className="text-primary" />
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
              {stats.map((stat, i) => (
                <Card key={stat.label} className="modern-card group hover:scale-105 transition-transform duration-500">
                  <CardContent className="p-8">
                    <div className="text-4xl mb-4">{stat.icon}</div>
                    <div className="text-4xl font-black text-primary mb-2">{stat.value}</div>
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
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Core Features</span>
            </div>
            <h2 className="heading-lg mb-6">
              Everything to <span className="text-primary italic">Control</span> Your Inventory
            </h2>
            <p className="paragraph-lg">
              From barcode scanning to multi-location management, handle complexity with ease.
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
                <Card className="modern-card h-full group hover:border-primary/30 transition-all duration-500">
                  <CardContent className="p-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                        {feature.icon}
                      </div>
                      <div className="bg-foreground/[0.03] dark:bg-white/5 px-4 py-1.5 rounded-full">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{feature.tag}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-foreground/60 leading-relaxed mb-6 italic">{feature.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.highlights.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
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
              Get Started in <span className="text-secondary italic">3 Steps</span>
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
              Power Features for <span className="text-warning italic">Serious</span> Retailers
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
              Questions? <span className="text-primary italic">Answered.</span>
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
                  <div className="text-6xl mb-8">📦</div>
                  <h2 className="heading-lg mb-6">
                    Take Control of Your <span className="text-primary italic">Inventory</span> Today
                  </h2>
                  <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                    Join thousands of Indian retailers who have eliminated stockouts and increased profits.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild className="font-black px-12 h-16 shadow-xl shadow-primary/30 uppercase tracking-widest rounded-full">
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
