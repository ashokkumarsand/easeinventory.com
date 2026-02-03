'use client';

import { Button, Card, CardBody, Chip, Input } from '@heroui/react';
import { Check, Globe, Lock, Palette, Rocket, Smartphone, Sparkles, Upload } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const brandingFeatures = [
  {
    icon: Globe,
    title: 'Free Subdomain',
    description: 'Get your own yourstore.easeinventory.com URL. Claim it during signup—first come, first served.',
    highlights: ['Unique business URL', 'Easy to remember', 'Share on cards/marketing', 'Instant activation'],
  },
  {
    icon: Upload,
    title: 'Custom Logo & Favicon',
    description: 'Upload your business logo. It appears on your storefront, invoices, and customer-facing pages.',
    highlights: ['Logo on dashboard', 'Logo on invoices', 'Custom favicon', 'High-res support'],
  },
  {
    icon: Palette,
    title: 'Brand Colors',
    description: 'Choose your primary color to match your brand. Dashboard, buttons, and accents update automatically.',
    highlights: ['Color picker', 'Preset palettes', 'Dark mode support', 'Consistent theming'],
  },
  {
    icon: Sparkles,
    title: 'Custom Domain (Pro)',
    description: 'Connect your own domain like inventory.yourbusiness.com via CNAME. Free SSL included.',
    highlights: ['CNAME setup', 'Free SSL certificate', 'SEO friendly', 'Professional look'],
  },
];

const comparisonTable = [
  { feature: 'Subdomain (yourstore.easeinventory.com)', starter: '✓', business: '✓', professional: '✓' },
  { feature: 'Custom Logo', starter: '✓', business: '✓', professional: '✓' },
  { feature: 'Custom Favicon', starter: '—', business: '✓', professional: '✓' },
  { feature: 'Brand Colors', starter: '—', business: '✓', professional: '✓' },
  { feature: 'Custom Domain (your.domain.com)', starter: '—', business: '—', professional: '✓' },
  { feature: 'White-label (Remove EaseInventory branding)', starter: '—', business: '—', professional: 'Add-on' },
];

const setupSteps = [
  {
    step: '01',
    title: 'Claim Your Subdomain',
    description: 'During registration, enter your preferred subdomain. We check availability instantly.',
  },
  {
    step: '02',
    title: 'Upload Your Logo',
    description: 'Go to Settings → Branding. Upload your logo (PNG or JPG, recommended 200x200px).',
  },
  {
    step: '03',
    title: 'Pick Your Colors',
    description: 'Choose a primary color. Your dashboard and customer pages update automatically.',
  },
  {
    step: '04',
    title: 'Go Live!',
    description: 'Your branded URL is live. Share it on business cards, social media, and marketing materials.',
  },
];

const useCases = [
  {
    title: 'Multi-Brand Retailers',
    description: "Run multiple stores? Each store gets its own subdomain with unique branding. Manage all from one master account.",
    icon: '🏪',
  },
  {
    title: 'Franchise Operations',
    description: 'Give each franchise location their own branded portal while maintaining central control.',
    icon: '🔗',
  },
  {
    title: 'Agency Resellers',
    description: 'Resell EaseInventory to clients with white-label branding. Your brand, your clients.',
    icon: '🤝',
  },
];

const faqs = [
  {
    question: 'Can I change my subdomain later?',
    answer: "Yes, you can change your subdomain once per month via Settings → Domains. Note that the old URL will stop working immediately, so update your marketing materials first.",
  },
  {
    question: 'Is the subdomain included in the free trial?',
    answer: 'Yes! You claim your subdomain during signup and it remains yours throughout the trial and beyond—no extra cost.',
  },
  {
    question: 'How do I set up a custom domain?',
    answer: "It's a 3-step process: (1) Go to Settings → Domains → Custom Domain (2) Add a CNAME record at your domain registrar pointing to custom.easeinventory.com (3) Enter your domain in our dashboard. SSL is automatically provisioned.",
  },
  {
    question: 'What is white-label branding?',
    answer: "White-label removes all EaseInventory branding from the interface. Your clients see only your company name and logo. It's available as an add-on for Professional plan users.",
  },
  {
    question: 'Will my subdomain affect SEO?',
    answer: 'Subdomains are indexed by Google like regular domains. For best SEO, we recommend using a custom domain (yourcompany.com). We set up proper meta tags and sitemap for you.',
  },
];

export default function SubdomainPage() {
  const [subdomain, setSubdomain] = useState('');

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[200px]" />
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
                <Globe size={14} className="text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Branding</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                Your Business.<br />
                <span className="text-primary">Your Identity.</span>
              </h1>
              
              <p className="text-lg text-foreground/60 leading-relaxed mb-8 max-w-xl">
                Claim your unique .easeinventory.com URL. Add your logo, choose your colors, 
                and create a professional presence that customers remember.
              </p>
              
              {/* Subdomain Checker */}
              <Card className="modern-card mb-8">
                <CardBody className="p-6">
                  <p className="text-sm font-bold mb-3">Check Subdomain Availability</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="yourstore"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      endContent={<span className="text-foreground/40 text-sm">.easeinventory.com</span>}
                      classNames={{ input: 'font-mono' }}
                    />
                    <Button as={Link} href={`/register?subdomain=${subdomain}`} color="primary" className="font-bold shrink-0">
                      Claim It
                    </Button>
                  </div>
                  {subdomain && (
                    <p className="text-xs text-foreground/50 mt-2">
                      Your URL will be: <span className="font-mono text-primary">{subdomain}.easeinventory.com</span>
                    </p>
                  )}
                </CardBody>
              </Card>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-primary" />
                  <span className="text-foreground/60">Free with all plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-primary" />
                  <span className="text-foreground/60">SSL included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-primary" />
                  <span className="text-foreground/60">Setup in 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Visual Preview */}
            <div className="relative">
              <Card className="modern-card overflow-hidden">
                <div className="bg-foreground/[0.02] border-b border-foreground/5 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-foreground/5 rounded-full px-4 py-1 flex items-center gap-2">
                      <Lock size={12} className="text-green-500" />
                      <span className="text-xs font-mono text-foreground/50">yourstore.easeinventory.com</span>
                    </div>
                  </div>
                </div>
                <CardBody className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Smartphone size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-black">Your Store Name</p>
                      <p className="text-sm text-foreground/50">Mobile Accessories & Repairs</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-foreground/5 rounded-full w-3/4" />
                    <div className="h-4 bg-foreground/5 rounded-full w-1/2" />
                    <div className="h-4 bg-foreground/5 rounded-full w-2/3" />
                  </div>
                  <div className="mt-6 flex gap-2">
                    <div className="h-10 bg-primary rounded-lg flex-1" />
                    <div className="h-10 bg-foreground/5 rounded-lg w-24" />
                  </div>
                </CardBody>
              </Card>
              <div className="absolute -bottom-4 -right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                ✓ Your Brand
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="primary" variant="flat" className="mb-4">Branding Features</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Make It Truly Yours
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {brandingFeatures.map((feature) => (
              <Card key={feature.title} className="modern-card overflow-hidden">
                <CardBody className="p-8">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon size={28} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                      <p className="text-foreground/60 mb-4">{feature.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {feature.highlights.map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm">
                            <Check size={14} className="text-primary shrink-0" />
                            <span className="text-foreground/70">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Steps */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="secondary" variant="flat" className="mb-4">Quick Setup</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready in 4 Easy Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {setupSteps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-secondary">{item.step}</span>
                </div>
                <h3 className="font-black mb-2">{item.title}</h3>
                <p className="text-sm text-foreground/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="warning" variant="flat" className="mb-4">By Plan</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Branding Features by Plan
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse max-w-4xl mx-auto">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left py-4 px-4 font-bold">Feature</th>
                  <th className="text-center py-4 px-4 font-bold">Starter</th>
                  <th className="text-center py-4 px-4 font-bold bg-primary/5">Business</th>
                  <th className="text-center py-4 px-4 font-bold">Professional</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row) => (
                  <tr key={row.feature} className="border-b border-foreground/5">
                    <td className="py-4 px-4 text-foreground/70">{row.feature}</td>
                    <td className="py-4 px-4 text-center">{row.starter}</td>
                    <td className="py-4 px-4 text-center bg-primary/5">{row.business}</td>
                    <td className="py-4 px-4 text-center">{row.professional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="success" variant="flat" className="mb-4">Use Cases</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Perfect For
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="modern-card text-center">
                <CardBody className="p-8">
                  <div className="text-5xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-black mb-2">{useCase.title}</h3>
                  <p className="text-foreground/60">{useCase.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="default" variant="flat" className="mb-4">FAQs</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.question} className="modern-card">
                <CardBody className="p-6">
                  <h3 className="font-black mb-3">{faq.question}</h3>
                  <p className="text-foreground/60">{faq.answer}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-custom">
          <Card className="modern-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardBody className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Claim Your Subdomain Now
              </h2>
              <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
                Good subdomains are going fast. Secure yours today—it's free with your account.
              </p>
              <Button as={Link} href="/register" color="primary" size="lg" className="font-black" radius="full">
                Start Free Trial & Claim URL
                <Rocket size={18} />
              </Button>
            </CardBody>
          </Card>
        </div>
      </section>
    </main>
  );
}
