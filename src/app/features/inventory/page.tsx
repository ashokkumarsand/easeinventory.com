'use client';

import { Button, Card, CardBody, Chip, Divider } from '@heroui/react';
import { ArrowRight, BarChart3, Check, Clock, Layers, MapPin, Package, QrCode, RefreshCw, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// Comprehensive feature data
const coreFeatures = [
  {
    icon: QrCode,
    title: 'Barcode & QR Scanning',
    description: 'Scan products instantly using your phone camera. Supports EAN-13, UPC, Code-128, and QR codes. No additional hardware needed.',
    details: ['Camera-based scanning', 'Supports 7+ barcode formats', 'Print custom labels', 'Bulk barcode generation'],
  },
  {
    icon: Layers,
    title: 'Serial Number Tracking',
    description: 'Track individual units with unique serial numbers. Perfect for electronics, appliances, and high-value items with warranty tracking.',
    details: ['Unique unit identification', 'Warranty tracking', 'History per unit', 'Easy recall management'],
  },
  {
    icon: MapPin,
    title: 'Multi-Location Management',
    description: 'Manage inventory across multiple stores, warehouses, and locations. Transfer stock seamlessly with full audit trails.',
    details: ['Unlimited locations', 'Inter-location transfers', 'Location-wise reports', 'Centralized dashboard'],
  },
  {
    icon: TrendingUp,
    title: 'Automated Profit Analysis',
    description: 'Know your margins instantly. Automatic calculation of cost price, sale price, and profit percentage for every item.',
    details: ['Real-time profit tracking', 'Margin alerts', 'Cost history', 'Pricing suggestions'],
  },
];

const advancedFeatures = [
  {
    icon: Clock,
    title: 'Batch & Expiry Tracking',
    description: 'Track batch numbers and expiry dates. FIFO/FEFO alerts ensure oldest stock sells first. Essential for pharma, food, and FMCG.',
  },
  {
    icon: RefreshCw,
    title: 'Stock Movement History',
    description: 'Complete audit trail of every stock movement. Know who moved what, when, and why. Perfect for compliance and analysis.',
  },
  {
    icon: Shield,
    title: 'Low Stock Alerts',
    description: 'Never run out of stock. Automated alerts when inventory falls below minimum levels. Configurable per product.',
  },
  {
    icon: BarChart3,
    title: 'Inventory Analytics',
    description: 'Identify slow-moving items, fast sellers, and dead stock. Make data-driven purchasing decisions.',
  },
];

const useCases = [
  {
    title: 'Electronics & Mobile Stores',
    description: 'Track IMEI numbers, warranty periods, and accessories. Manage repairs alongside inventory.',
    icon: '📱',
  },
  {
    title: 'Pharmacies & Medical Shops',
    description: 'Batch tracking with expiry dates. Drug license compliance. Schedule H drug management.',
    icon: '💊',
  },
  {
    title: 'Fashion & Apparel',
    description: 'Size and color variants. Season-wise inventory. Multi-brand management.',
    icon: '👗',
  },
  {
    title: 'Hardware & Auto Parts',
    description: 'SKU management with vehicle compatibility. OEM vs aftermarket tracking.',
    icon: '🔧',
  },
];

const pricingComparison = [
  { feature: 'Number of Products', starter: '500', business: '5,000', professional: 'Unlimited' },
  { feature: 'Locations', starter: '1', business: '3', professional: '10+' },
  { feature: 'Barcode Scanning', starter: '✓', business: '✓', professional: '✓' },
  { feature: 'Serial Number Tracking', starter: '—', business: '✓', professional: '✓' },
  { feature: 'Batch/Expiry Tracking', starter: '—', business: '✓', professional: '✓' },
  { feature: 'Advanced Analytics', starter: '—', business: '—', professional: '✓' },
];

const faqs = [
  {
    question: 'Can I import my existing inventory from Excel?',
    answer: 'Yes! EaseInventory supports bulk import from Excel and CSV files. Our guided import wizard maps your columns automatically. You can import product names, SKUs, quantities, prices, and even images in one go.',
  },
  {
    question: 'How does serial number tracking work?',
    answer: 'When you purchase or receive stock, you can assign unique serial numbers to each unit. These serial numbers are tracked through sales, repairs, and returns. You can search any serial number to see its complete history.',
  },
  {
    question: 'Can I manage multiple stores from one account?',
    answer: 'Absolutely. Add unlimited locations (stores, warehouses, vans) and track inventory at each. Transfer stock between locations with full documentation. Each location can have its own staff with role-based access.',
  },
  {
    question: 'Do I need special hardware for barcode scanning?',
    answer: 'No! EaseInventory uses your phone or tablet camera for barcode scanning. Works with any smartphone. You can also use traditional USB barcode scanners if you prefer.',
  },
];

export default function PrecisionInventoryPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
                <Package size={14} className="text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Inventory Management</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                Know Your Stock.<br />
                <span className="text-primary">Down to the Last Unit.</span>
              </h1>
              
              <p className="text-lg text-foreground/60 leading-relaxed mb-8 max-w-xl">
                EaseInventory gives you complete visibility into your stock. Track every item with 
                serial numbers, scan barcodes with your phone, get low-stock alerts, and analyze 
                profitability—all in real-time, across all your locations.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button as={Link} href="/register" color="primary" size="lg" className="font-black" radius="full">
                  Start 14-Day Free Trial
                  <ArrowRight size={18} />
                </Button>
                <Button as={Link} href="#demo" variant="bordered" size="lg" className="font-bold" radius="full">
                  Watch Demo Video
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-primary" />
                  <span className="text-foreground/60">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-primary" />
                  <span className="text-foreground/60">Setup in 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-primary" />
                  <span className="text-foreground/60">Free data import</span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="modern-card p-6">
                  <div className="text-4xl font-black text-primary mb-2">99.9%</div>
                  <div className="text-sm font-bold text-foreground/50">Inventory Accuracy</div>
                  <p className="text-xs text-foreground/40 mt-2">Average across our customers after 3 months</p>
                </Card>
                <Card className="modern-card p-6">
                  <div className="text-4xl font-black text-primary mb-2">50%</div>
                  <div className="text-sm font-bold text-foreground/50">Time Saved</div>
                  <p className="text-xs text-foreground/40 mt-2">On stock counting and reconciliation</p>
                </Card>
                <Card className="modern-card p-6">
                  <div className="text-4xl font-black text-primary mb-2">&lt;2s</div>
                  <div className="text-sm font-bold text-foreground/50">Search Speed</div>
                  <p className="text-xs text-foreground/40 mt-2">Find any product across 10,000+ SKUs</p>
                </Card>
                <Card className="modern-card p-6">
                  <div className="text-4xl font-black text-primary mb-2">₹0</div>
                  <div className="text-sm font-bold text-foreground/50">Stockout Losses</div>
                  <p className="text-xs text-foreground/40 mt-2">With automated reorder alerts</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-foreground/5 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center items-center gap-8 text-foreground/40">
            <span className="text-sm font-bold">Trusted by 2,000+ Indian retail businesses</span>
            <Divider orientation="vertical" className="h-6 hidden md:block" />
            <div className="flex gap-6 text-xs font-medium">
              <span>Mobile Stores</span>
              <span>•</span>
              <span>Pharmacies</span>
              <span>•</span>
              <span>Electronics</span>
              <span>•</span>
              <span>Fashion</span>
              <span>•</span>
              <span>Hardware</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 lg:py-28">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="primary" variant="flat" className="mb-4">Core Features</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Everything You Need to Control Your Inventory
            </h2>
            <p className="text-foreground/60">
              From barcode scanning to multi-location management, EaseInventory handles the 
              complexity so you can focus on selling.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreFeatures.map((feature) => (
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
                        {feature.details.map((detail) => (
                          <div key={detail} className="flex items-center gap-2 text-sm">
                            <Check size={14} className="text-primary shrink-0" />
                            <span className="text-foreground/70">{detail}</span>
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

      {/* How It Works */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="secondary" variant="flat" className="mb-4">How It Works</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Import Your Products',
                description: 'Upload your existing inventory via Excel or add products manually. Our wizard auto-maps columns and validates data.',
              },
              {
                step: '02',
                title: 'Configure Locations & Stock Levels',
                description: 'Set up your stores, warehouses, and define minimum stock levels for each product. Enable alerts.',
              },
              {
                step: '03',
                title: 'Start Tracking',
                description: 'Scan barcodes, record purchases, process sales. Every movement is tracked automatically in real-time.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black text-primary">{item.step}</span>
                </div>
                <h3 className="text-xl font-black mb-3">{item.title}</h3>
                <p className="text-foreground/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="warning" variant="flat" className="mb-4">Advanced Features</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Power Features for Serious Retailers
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedFeatures.map((feature) => (
              <Card key={feature.title} className="modern-card">
                <CardBody className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                    <feature.icon size={24} className="text-warning" />
                  </div>
                  <h3 className="font-black mb-2">{feature.title}</h3>
                  <p className="text-sm text-foreground/60">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="success" variant="flat" className="mb-4">Industry Solutions</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Built for Indian Retail Businesses
            </h2>
            <p className="text-foreground/60">
              Whether you run a mobile shop, pharmacy, or fashion store, EaseInventory adapts to your unique needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="modern-card hover:border-primary/30 transition-colors">
                <CardBody className="p-6 text-center">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="font-black mb-2">{useCase.title}</h3>
                  <p className="text-sm text-foreground/60">{useCase.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="primary" variant="flat" className="mb-4">Pricing</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Inventory Features by Plan
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left py-4 px-4 font-bold">Feature</th>
                  <th className="text-center py-4 px-4 font-bold">Starter<br /><span className="text-sm font-normal text-foreground/50">₹999/mo</span></th>
                  <th className="text-center py-4 px-4 font-bold bg-primary/5">Business<br /><span className="text-sm font-normal text-foreground/50">₹2,499/mo</span></th>
                  <th className="text-center py-4 px-4 font-bold">Professional<br /><span className="text-sm font-normal text-foreground/50">₹4,999/mo</span></th>
                </tr>
              </thead>
              <tbody>
                {pricingComparison.map((row) => (
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

          <div className="text-center mt-8">
            <Button as={Link} href="/pricing" color="primary" variant="flat" radius="full">
              View Full Pricing Details
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-foreground/[0.02]">
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
                Take Control of Your Inventory Today
              </h2>
              <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
                Join 2,000+ Indian retailers who've eliminated stockouts, reduced waste, 
                and increased profits with EaseInventory.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button as={Link} href="/register" color="primary" size="lg" className="font-black" radius="full">
                  Start Free 14-Day Trial
                  <ArrowRight size={18} />
                </Button>
                <Button as={Link} href="/contact" variant="bordered" size="lg" className="font-bold" radius="full">
                  Talk to Sales
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </main>
  );
}
