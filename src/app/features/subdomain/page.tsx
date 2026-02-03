'use client';

import { Button, Card, CardBody, Input } from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const stats = [
  { value: 'Free', label: 'Subdomain Included', icon: '🎁' },
  { value: 'SSL', label: 'Auto-Provisioned', icon: '🔒' },
  { value: '2min', label: 'Setup Time', icon: '⚡' },
  { value: '100%', label: 'Uptime Guaranteed', icon: '🛡️' },
];

const coreFeatures = [
  {
    icon: '🌐',
    title: 'Free Subdomain',
    tag: 'Essential',
    description: 'Get your own yourstore.easeinventory.com URL. Claim it during signup—first come, first served.',
    highlights: ['Unique business URL', 'Easy to remember', 'Marketing ready', 'Instant activation'],
  },
  {
    icon: '🖼️',
    title: 'Custom Logo & Favicon',
    tag: 'Brand',
    description: 'Upload your business logo. It appears on your storefront, invoices, and customer-facing pages.',
    highlights: ['Dashboard branding', 'Invoice headers', 'Custom favicon', 'High-res support'],
  },
  {
    icon: '🎨',
    title: 'Brand Colors',
    tag: 'Style',
    description: 'Choose your primary color to match your brand. Dashboard, buttons, and accents update automatically.',
    highlights: ['Color picker', 'Preset palettes', 'Dark mode ready', 'Consistent theming'],
  },
  {
    icon: '✨',
    title: 'Custom Domain',
    tag: 'Pro',
    description: 'Connect your own domain like inventory.yourbusiness.com via CNAME. Free SSL included.',
    highlights: ['CNAME setup', 'Free SSL certificate', 'SEO friendly', 'Professional look'],
  },
];

const howItWorks = [
  { step: '01', title: 'Claim Subdomain', description: 'During registration, enter your preferred subdomain. We check availability instantly.', icon: '🔍' },
  { step: '02', title: 'Upload Branding', description: 'Go to Settings → Branding. Upload your logo (PNG or JPG, recommended 200x200px).', icon: '📤' },
  { step: '03', title: 'Go Live', description: 'Your branded URL is live. Share it on business cards, social media, and marketing.', icon: '🚀' },
];

const additionalFeatures = [
  { icon: '🔐', title: 'SSL Certificate', description: 'Free SSL auto-provisioned for all subdomains and custom domains.' },
  { icon: '🌍', title: 'Custom Domain', description: 'Connect your own domain via CNAME (Professional plan).' },
  { icon: '🎨', title: 'Theme Colors', description: 'Match your brand with custom primary and accent colors.' },
  { icon: '📷', title: 'Logo Upload', description: 'Your logo on dashboard, invoices, and customer pages.' },
  { icon: '🏷️', title: 'White Label', description: 'Remove EaseInventory branding completely (add-on).' },
  { icon: '⚡', title: 'Fast CDN', description: 'Global CDN ensures fast loading worldwide.' },
];

const faqs = [
  { q: 'Can I change my subdomain later?', a: 'Yes, you can change your subdomain once per month via Settings → Domains. Update your marketing materials first.' },
  { q: 'Is the subdomain included in the free trial?', a: 'Yes! Claim your subdomain during signup and it remains yours throughout the trial and beyond.' },
  { q: 'How do I set up a custom domain?', a: 'Add a CNAME record at your registrar pointing to custom.easeinventory.com, then enter your domain in our dashboard.' },
  { q: 'What is white-label branding?', a: 'White-label removes all EaseInventory branding. Your clients see only your company name and logo.' },
];

export default function SubdomainPage() {
  const [subdomain, setSubdomain] = useState('');

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
                <span className="text-xl">🌐</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Branding & Identity</span>
              </div>

              <h1 className="heading-lg mb-8">
                Your Business.<br />
                <span className="text-primary italic">Your Identity.</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-xl">
                Claim your unique .easeinventory.com URL. Add your logo, choose your colors,
                and create a professional presence that customers remember.
              </p>

              {/* Subdomain Checker */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="modern-card mb-10">
                  <CardBody className="p-8">
                    <p className="text-sm font-black mb-4 uppercase tracking-widest text-foreground/50">Check Availability</p>
                    <div className="flex gap-3">
                      <Input
                        placeholder="yourstore"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        endContent={<span className="text-foreground/40 text-sm font-mono">.easeinventory.com</span>}
                        classNames={{ input: 'font-mono text-lg', inputWrapper: 'h-14' }}
                        size="lg"
                      />
                      <Button as={Link} href={`/register?subdomain=${subdomain}`} color="primary" className="font-black h-14 px-8 shrink-0 uppercase tracking-widest shadow-lg shadow-primary/20" radius="full">
                        Claim It
                      </Button>
                    </div>
                    {subdomain && (
                      <p className="text-sm text-foreground/50 mt-4 italic">
                        Preview: <span className="font-mono text-primary font-bold">{subdomain}.easeinventory.com</span>
                      </p>
                    )}
                  </CardBody>
                </Card>
              </motion.div>

              <div className="flex flex-wrap gap-8">
                {['Free with all plans', 'SSL included', 'Setup in 2 minutes'].map((item) => (
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
              {stats.map((stat) => (
                <Card key={stat.label} className="modern-card group hover:scale-105 transition-transform duration-500">
                  <CardBody className="p-8">
                    <div className="text-4xl mb-4">{stat.icon}</div>
                    <div className="text-4xl font-black text-primary mb-2">{stat.value}</div>
                    <div className="text-sm font-bold text-foreground/50">{stat.label}</div>
                  </CardBody>
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
              Make It <span className="text-primary italic">Truly Yours</span>
            </h2>
            <p className="paragraph-lg">
              Build a professional brand presence with custom URL, logo, and colors.
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
                  <CardBody className="p-10">
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
                  </CardBody>
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
              Ready in <span className="text-secondary italic">3 Easy Steps</span>
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
              Professional <span className="text-warning italic">Branding</span> Options
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
                  <CardBody className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-black mb-3 uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-foreground/60 italic">{feature.description}</p>
                  </CardBody>
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
                  <CardBody className="p-8">
                    <h3 className="text-lg font-black mb-3">{faq.q}</h3>
                    <p className="text-foreground/60 italic leading-relaxed">{faq.a}</p>
                  </CardBody>
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
              <CardBody className="p-12 lg:p-20 text-center relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-6xl mb-8">🌐</div>
                  <h2 className="heading-lg mb-6">
                    Claim Your <span className="text-primary italic">Subdomain</span> Now
                  </h2>
                  <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                    Good subdomains are going fast. Secure yours today—it's free with your account.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button as={Link} href="/register" color="primary" size="lg" className="font-black px-12 h-16 shadow-xl shadow-primary/30 uppercase tracking-widest" radius="full">
                      Start Free Trial
                      <ArrowRight size={20} />
                    </Button>
                    <Button as={Link} href="/#contact" variant="bordered" size="lg" className="font-black px-12 h-16 uppercase tracking-widest border-foreground/10" radius="full">
                      Talk to Sales
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
