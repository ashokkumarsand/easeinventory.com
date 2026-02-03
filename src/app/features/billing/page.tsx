'use client';

import { Button, Card, CardBody, Chip } from '@heroui/react';
import { ArrowRight, Check, CreditCard, Download, FileText, Globe, IndianRupee, Printer, QrCode, Receipt, RefreshCw, Send, Shield } from 'lucide-react';
import Link from 'next/link';

const gstFeatures = [
  {
    icon: FileText,
    title: 'Smart GST Invoicing',
    description: 'Generate 100% GST-compliant invoices with automatic CGST, SGST, and IGST calculations. Supports B2B and B2C invoices with proper format.',
    highlights: ['Auto tax calculation', 'B2B & B2C formats', 'Credit/Debit notes', 'Reverse charge support'],
  },
  {
    icon: Receipt,
    title: 'HSN Code Management',
    description: 'Built-in HSN code database with over 10,000 codes. Auto-suggest HSN based on product name. Bulk assign HSN codes to categories.',
    highlights: ['10,000+ HSN codes', 'Smart suggestions', 'Category mapping', 'SAC codes for services'],
  },
  {
    icon: Printer,
    title: 'Multi-Format Printing',
    description: 'Print invoices on thermal printers (58mm, 80mm), A4, A5, or generate PDF for email/WhatsApp. Customize layout with your branding.',
    highlights: ['Thermal 58mm/80mm', 'A4/A5/Letter', 'PDF generation', 'Custom templates'],
  },
  {
    icon: Globe,
    title: 'E-Invoicing Ready',
    description: 'For businesses with turnover above ₹5 crore, generate e-invoices compliant with NIC portal. Auto QR code generation with IRN.',
    highlights: ['NIC portal integrated', 'Auto IRN generation', 'QR code on invoice', 'E-way bill linking'],
  },
];

const taxRates = [
  { rate: '0%', description: 'Exempt goods', examples: 'Fresh fruits, vegetables, milk' },
  { rate: '5%', description: 'Essential items', examples: 'Packaged food, footwear under ₹1000' },
  { rate: '12%', description: 'Standard goods', examples: 'Apparel, processed food, medicines' },
  { rate: '18%', description: 'Most goods & services', examples: 'Electronics, IT services, restaurants' },
  { rate: '28%', description: 'Luxury & sin goods', examples: 'Cars, AC, aerated drinks' },
];

const additionalFeatures = [
  { icon: CreditCard, title: 'Digital Payments', description: 'Accept UPI, cards, wallets. Payment links via WhatsApp.' },
  { icon: Download, title: 'GSTR-1 Export', description: 'One-click export in government format for filing.' },
  { icon: IndianRupee, title: 'Multi-Currency', description: 'Export invoices in USD, AED for international sales.' },
  { icon: RefreshCw, title: 'Recurring Invoices', description: 'Auto-generate monthly invoices for subscriptions.' },
  { icon: Send, title: 'WhatsApp Invoices', description: 'Send invoice PDF directly via WhatsApp with one click.' },
  { icon: QrCode, title: 'UPI QR on Invoice', description: 'Dynamic UPI QR code for instant payment collection.' },
];

const invoiceTypes = [
  { type: 'Tax Invoice', use: 'Regular B2B/B2C sales', description: 'Standard invoice with GSTIN, HSN, breakup' },
  { type: 'Bill of Supply', use: 'Exempt/composition dealer', description: 'For exempt goods or composition scheme' },
  { type: 'Credit Note', use: 'Returns/discounts', description: 'Reduce tax liability for returned goods' },
  { type: 'Debit Note', use: 'Additional charges', description: 'For additional charges post-invoice' },
  { type: 'Delivery Challan', use: 'Stock transfer', description: 'For sending goods without sale' },
  { type: 'Proforma Invoice', use: 'Quotations', description: 'Pre-sale quotation for customers' },
];

const complianceFeatures = [
  {
    title: 'GSTIN Validation',
    description: 'Real-time validation of customer GSTIN against government database. Auto-fetch business name and address.',
  },
  {
    title: 'Invoice Number Series',
    description: 'Maintain separate invoice series per financial year. Auto-reset on April 1st. Configurable prefix/suffix.',
  },
  {
    title: 'Place of Supply Rules',
    description: 'Automatic determination of CGST+SGST vs IGST based on seller and buyer state codes.',
  },
  {
    title: 'Audit Trail',
    description: 'Complete history of every invoice—creation, edits, cancellations. Required for GST audits.',
  },
];

const faqs = [
  {
    question: 'Is EaseInventory compliant with GST rules?',
    answer: 'Yes, 100%. Our invoices follow all GST format requirements including mandatory fields, tax breakup, HSN/SAC codes, and QR code for e-invoicing. We update the software whenever GST rules change.',
  },
  {
    question: 'Can I generate e-invoices for government portal?',
    answer: "Yes. If your turnover exceeds ₹5 crore, you can generate e-invoices directly. We integrate with NIC's e-invoice portal. The IRN and QR code are automatically added to your invoices.",
  },
  {
    question: 'How do I export data for GSTR-1 filing?',
    answer: 'Go to Reports → GST Reports → GSTR-1. Select the month and click Export. You get a JSON file ready to upload on the GST portal. We also provide Excel format for verification.',
  },
  {
    question: 'Can I use thermal printers for billing?',
    answer: 'Yes! EaseInventory works with any thermal printer (58mm or 80mm). We auto-format invoices for thermal width. Just connect via USB or Bluetooth and print.',
  },
  {
    question: 'How do digital payments work?',
    answer: 'We integrate with Razorpay and PhonePe for UPI, cards, and wallets. Generate payment links, share via WhatsApp, and receive instant payment confirmations with auto-reconciliation.',
  },
];

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-success/5 to-transparent" />
        <div className="absolute top-40 left-20 w-80 h-80 bg-success/10 rounded-full blur-[150px]" />
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 px-4 py-2 rounded-full mb-6">
                <Receipt size={14} className="text-success" />
                <span className="text-xs font-black uppercase tracking-widest text-success">GST Compliance</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                GST Billing in<br />
                <span className="text-success">Under 5 Seconds.</span>
              </h1>
              
              <p className="text-lg text-foreground/60 leading-relaxed mb-8 max-w-xl">
                Generate 100% compliant GST invoices instantly. HSN codes, tax calculations, 
                e-invoicing, thermal printing, and GSTR-1 export—all automated for Indian retailers.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button as={Link} href="/register" color="success" size="lg" className="font-black" radius="full">
                  Start 14-Day Free Trial
                  <ArrowRight size={18} />
                </Button>
                <Button as={Link} href="#features" variant="bordered" size="lg" className="font-bold" radius="full">
                  Explore Features
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-success" />
                  <span className="text-foreground/60">E-invoicing ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-success" />
                  <span className="text-foreground/60">GSTR-1 export</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-success" />
                  <span className="text-foreground/60">Thermal printing</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="modern-card p-6">
                <div className="text-4xl font-black text-success mb-2">&lt;5s</div>
                <div className="text-sm font-bold text-foreground/50">Invoice Generation</div>
                <p className="text-xs text-foreground/40 mt-2">From product scan to print</p>
              </Card>
              <Card className="modern-card p-6">
                <div className="text-4xl font-black text-success mb-2">100%</div>
                <div className="text-sm font-bold text-foreground/50">GST Compliant</div>
                <p className="text-xs text-foreground/40 mt-2">All mandatory fields covered</p>
              </Card>
              <Card className="modern-card p-6">
                <div className="text-4xl font-black text-success mb-2">₹0</div>
                <div className="text-sm font-bold text-foreground/50">Filing Penalties</div>
                <p className="text-xs text-foreground/40 mt-2">With accurate GSTR exports</p>
              </Card>
              <Card className="modern-card p-6">
                <div className="text-4xl font-black text-success mb-2">5</div>
                <div className="text-sm font-bold text-foreground/50">Tax Rates</div>
                <p className="text-xs text-foreground/40 mt-2">0%, 5%, 12%, 18%, 28%</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Rates */}
      <section className="py-12 bg-foreground/[0.02] border-y border-foreground/5">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h3 className="font-black text-lg">Supports All GST Tax Slabs</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {taxRates.map((tax) => (
              <div key={tax.rate} className="text-center px-6 py-3 bg-background rounded-xl border border-foreground/5">
                <div className="text-2xl font-black text-success">{tax.rate}</div>
                <div className="text-xs text-foreground/50">{tax.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="success" variant="flat" className="mb-4">Core Features</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Complete GST Billing Solution
            </h2>
            <p className="text-foreground/60">
              Everything you need to bill customers, stay compliant, and file returns on time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {gstFeatures.map((feature) => (
              <Card key={feature.title} className="modern-card overflow-hidden">
                <CardBody className="p-8">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center shrink-0">
                      <feature.icon size={28} className="text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                      <p className="text-foreground/60 mb-4">{feature.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {feature.highlights.map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm">
                            <Check size={14} className="text-success shrink-0" />
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

      {/* Invoice Types */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="primary" variant="flat" className="mb-4">Document Types</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              All the Documents You Need
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoiceTypes.map((doc) => (
              <Card key={doc.type} className="modern-card">
                <CardBody className="p-6">
                  <h3 className="font-black mb-1">{doc.type}</h3>
                  <p className="text-xs text-success font-bold mb-2">{doc.use}</p>
                  <p className="text-sm text-foreground/60">{doc.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* More Features */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="warning" variant="flat" className="mb-4">More Features</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Beyond Basic Invoicing
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature) => (
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

      {/* Compliance */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="danger" variant="flat" className="mb-4">Compliance</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Stay Audit-Ready
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {complianceFeatures.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center shrink-0 mt-1">
                  <Shield size={16} className="text-danger" />
                </div>
                <div>
                  <h3 className="font-black mb-2">{feature.title}</h3>
                  <p className="text-foreground/60 text-sm">{feature.description}</p>
                </div>
              </div>
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
          <Card className="modern-card bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardBody className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Simplify Your GST Billing Today
              </h2>
              <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
                Join thousands of Indian retailers who bill faster and file with confidence.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button as={Link} href="/register" color="success" size="lg" className="font-black" radius="full">
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
