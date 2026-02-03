'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const stats = [
  { value: '1000+', label: 'Active Retailers', icon: '🏪' },
  { value: '50L+', label: 'Monthly Transactions', icon: '📊' },
  { value: '100+', label: 'Cities Covered', icon: '🗺️' },
  { value: '99.9%', label: 'Uptime', icon: '⚡' },
];

const brandAssets = [
  { name: 'Logo (Dark)', description: 'For light backgrounds', format: 'PNG, SVG' },
  { name: 'Logo (Light)', description: 'For dark backgrounds', format: 'PNG, SVG' },
  { name: 'Icon Only', description: 'App icon and favicons', format: 'PNG, ICO' },
  { name: 'Brand Guidelines', description: 'Colors, typography, usage', format: 'PDF' },
];

const pressReleases = [
  { date: 'Feb 2026', title: 'EaseInventory Launches Multi-Location Feature for Retail Chains', tag: 'Product' },
  { date: 'Jan 2026', title: 'WhatsApp Business API Integration Now Available for All Plans', tag: 'Feature' },
  { date: 'Dec 2025', title: 'EaseInventory Crosses 1000 Active Retailers Milestone', tag: 'Growth' },
  { date: 'Oct 2025', title: 'Series Seed Funding Announcement - Building for India\'s Retail', tag: 'Funding' },
];

export default function PressPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-warning/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-3 bg-warning/10 border border-warning/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">📰</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning">Press Kit</span>
              </div>

              <h1 className="heading-lg mb-8">
                Press & <span className="text-warning italic">Media</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                Everything you need to write about EaseInventory. Brand assets, company info,
                and press releases—all in one place.
              </p>

              <Button
                color="warning"
                size="lg"
                className="font-black px-10 h-16 shadow-xl shadow-warning/30 uppercase tracking-widest"
                radius="full"
              >
                Download Full Press Kit
                <Download size={20} />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="section-padding relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <h2 className="heading-lg mb-6">
                Key <span className="text-primary italic">Numbers</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card group hover:scale-105 transition-transform duration-500">
                    <CardBody className="p-8 text-center">
                      <div className="text-4xl mb-4">{stat.icon}</div>
                      <div className="text-4xl font-black text-primary mb-2">{stat.value}</div>
                      <div className="text-sm font-bold text-foreground/50">{stat.label}</div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Assets */}
        <section className="section-padding bg-foreground/[0.02] relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-secondary animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Brand Assets</span>
              </div>
              <h2 className="heading-lg mb-6">
                Logo & <span className="text-secondary italic">Guidelines</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {brandAssets.map((asset, index) => (
                <motion.div
                  key={asset.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card h-full group hover:border-secondary/30 transition-all duration-500 cursor-pointer">
                    <CardBody className="p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Download size={28} className="text-secondary" />
                      </div>
                      <h3 className="font-black mb-2">{asset.name}</h3>
                      <p className="text-sm text-foreground/60 italic mb-2">{asset.description}</p>
                      <p className="text-xs text-foreground/40">{asset.format}</p>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Press Releases */}
        <section className="section-padding relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">News</span>
              </div>
              <h2 className="heading-lg mb-6">
                Press <span className="text-primary italic">Releases</span>
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-6">
              {pressReleases.map((release, index) => (
                <motion.div
                  key={release.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card group hover:border-primary/30 transition-all duration-500 cursor-pointer">
                    <CardBody className="p-8 flex items-center gap-6">
                      <div className="text-sm font-black text-foreground/40 uppercase tracking-widest shrink-0 w-24">
                        {release.date}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black mb-2 group-hover:text-primary transition-colors">{release.title}</h3>
                      </div>
                      <div className="bg-primary/10 px-3 py-1 rounded-full shrink-0">
                        <span className="text-xs font-black text-primary">{release.tag}</span>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Contact */}
        <section className="section-padding relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="modern-card bg-gradient-to-br from-warning/10 via-warning/5 to-transparent border-warning/20 overflow-hidden">
                <CardBody className="p-12 lg:p-20 text-center relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-warning/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="text-6xl mb-8">✉️</div>
                    <h2 className="heading-lg mb-6">
                      Media <span className="text-warning italic">Inquiries</span>
                    </h2>
                    <p className="paragraph-lg mb-6 max-w-2xl mx-auto">
                      For interviews, quotes, or additional information, contact our PR team:
                    </p>
                    <a href="mailto:press@easeinventory.com" className="text-2xl font-black text-warning hover:underline">
                      press@easeinventory.com
                    </a>
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
