'use client';

import FeaturePageTemplate, { FeaturePageConfig } from '@/components/features/FeaturePageTemplate';
import {
  Zap,
  CheckCircle,
  ClipboardList,
  Shield,
  FileText,
  Tag,
  Printer,
  Globe,
  ShoppingCart,
  Calculator,
  Share2,
  CreditCard,
  Download,
  RefreshCw,
  MessageSquare,
  Smartphone,
  FileSearch,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Instant GST Bills',
  hero: {
    title: (
      <>
        GST Billing in<br />
        <span className="gradient-text italic">Under 5 Seconds.</span>
      </>
    ),
    subtitle:
      'Generate 100% compliant GST invoices instantly. HSN codes, tax calculations, e-invoicing, thermal printing, and GSTR-1 export\u2014all automated.',
    trustItems: ['E-invoicing ready', 'GSTR-1 export', 'Thermal printing'],
  },
  stats: [
    { value: '<5s', label: 'Invoice Generation', icon: Zap },
    { value: '100%', label: 'GST Compliant', icon: CheckCircle },
    { value: '10K+', label: 'HSN Codes', icon: ClipboardList },
    { value: '\u20B90', label: 'Filing Penalties', icon: Shield },
  ],
  coreFeatures: [
    {
      icon: FileText,
      title: 'Smart GST Invoicing',
      tag: 'Compliance',
      description:
        'Generate 100% GST-compliant invoices with automatic CGST, SGST, and IGST calculations.',
      highlights: ['Auto tax calculation', 'B2B & B2C formats', 'Credit/Debit notes', 'Reverse charge'],
    },
    {
      icon: Tag,
      title: 'HSN Code Management',
      tag: 'Database',
      description:
        'Built-in HSN code database with over 10,000 codes. Auto-suggest based on product name.',
      highlights: ['10,000+ HSN codes', 'Smart suggestions', 'Category mapping', 'SAC for services'],
    },
    {
      icon: Printer,
      title: 'Multi-Format Printing',
      tag: 'Flexible',
      description:
        'Print on thermal printers (58mm, 80mm), A4, A5, or generate PDF for email/WhatsApp.',
      highlights: ['Thermal 58mm/80mm', 'A4/A5/Letter', 'PDF generation', 'Custom templates'],
    },
    {
      icon: Globe,
      title: 'E-Invoicing Ready',
      tag: 'Digital',
      description:
        'For businesses above \u20B95 crore, generate e-invoices compliant with NIC portal.',
      highlights: ['NIC integrated', 'Auto IRN generation', 'QR on invoice', 'E-way bill linking'],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'ADD PRODUCTS',
      title: 'Add Products',
      description: 'Scan barcode or search products to add to invoice with automatic pricing.',
      icon: ShoppingCart,
    },
    {
      number: '02',
      label: 'APPLY TAXES',
      title: 'Apply Taxes',
      description: 'GST calculated automatically based on HSN codes and customer location.',
      icon: Calculator,
    },
    {
      number: '03',
      label: 'PRINT & SHARE',
      title: 'Print & Share',
      description: 'Print on thermal/A4 or share PDF via WhatsApp with payment link.',
      icon: Share2,
    },
  ],
  extraFeatures: [
    { icon: CreditCard, title: 'Digital Payments', description: 'Accept UPI, cards, wallets. Payment links via WhatsApp.' },
    { icon: Download, title: 'GSTR-1 Export', description: 'One-click export in government format for filing.' },
    { icon: RefreshCw, title: 'Recurring Invoices', description: 'Auto-generate monthly invoices for subscriptions.' },
    { icon: MessageSquare, title: 'WhatsApp Invoices', description: 'Send invoice PDF directly via WhatsApp with one click.' },
    { icon: Smartphone, title: 'UPI QR on Invoice', description: 'Dynamic UPI QR code for instant payment collection.' },
    { icon: FileSearch, title: 'Audit Trail', description: 'Complete history of every invoice for GST audits.' },
  ],
  faqs: [
    {
      question: 'Is EaseInventory compliant with GST rules?',
      answer:
        'Yes, 100%. Our invoices follow all GST format requirements including mandatory fields, tax breakup, and HSN/SAC codes.',
    },
    {
      question: 'Can I generate e-invoices for government portal?',
      answer:
        'Yes. If your turnover exceeds \u20B95 crore, you can generate e-invoices directly with IRN and QR code.',
    },
    {
      question: 'How do I export data for GSTR-1 filing?',
      answer:
        'Go to Reports \u2192 GST Reports \u2192 GSTR-1. Select the month and click Export for a ready-to-upload JSON file.',
    },
    {
      question: 'Can I use thermal printers for billing?',
      answer:
        'Yes! Works with any thermal printer (58mm or 80mm). Just connect via USB or Bluetooth and print.',
    },
  ],
  cta: {
    icon: FileText,
    title: (
      <>
        Simplify Your <span className="gradient-text italic">GST Billing</span> Today
      </>
    ),
    subtitle: 'Join thousands of Indian retailers who bill faster and file with confidence.',
  },
};

export default function BillingPage() {
  return <FeaturePageTemplate config={config} />;
}
