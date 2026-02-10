'use client';

import FeaturePageTemplate, {
  type FeaturePageConfig,
} from '@/components/features/FeaturePageTemplate';
import {
  Link2,
  Users,
  Boxes,
  IndianRupee,
  CreditCard,
  TrendingDown,
  BarChart3,
  FileSpreadsheet,
  Scale,
  Timer,
  Handshake,
  Star,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Supply Chain',
  hero: {
    title: (
      <>
        End-to-End
        <br />
        <span className="gradient-text italic">Supply Chain Control.</span>
      </>
    ),
    subtitle:
      'Manage suppliers, bills of material, inventory valuation, payment terms and demand smoothing — all connected in one system.',
    trustItems: ['Multi-supplier support', 'BOM management', 'Working capital insights'],
  },
  stats: [
    { value: '30%', label: 'Cost Reduction', icon: IndianRupee },
    { value: '100+', label: 'Suppliers Managed', icon: Users },
    { value: '5x', label: 'Faster BOM Assembly', icon: Boxes },
    { value: '₹0', label: 'Missed Payment Penalties', icon: CreditCard },
  ],
  coreFeatures: [
    {
      icon: Users,
      title: 'Multi-Supplier Management',
      tag: 'Sourcing',
      description:
        'Link multiple suppliers to each product. Compare pricing, lead times and quality scores to make informed sourcing decisions.',
      highlights: [
        'Per-SKU suppliers',
        'Price comparison',
        'Lead time tracking',
        'Preferred supplier',
      ],
    },
    {
      icon: Boxes,
      title: 'BOM & Kit Management',
      tag: 'Manufacturing',
      description:
        'Define bills of material and kits with component quantities. Assemble products, track component availability and cost roll-ups.',
      highlights: [
        'Multi-level BOM',
        'Assembly tracking',
        'Cost roll-up',
        'Kit bundling',
      ],
    },
    {
      icon: IndianRupee,
      title: 'Inventory Valuation',
      tag: 'Finance',
      description:
        'Track inventory value with FIFO, LIFO and weighted average methods. Monitor working capital and stock-to-revenue ratios.',
      highlights: [
        'FIFO / LIFO / WAC',
        'Working capital',
        'Aged inventory',
        'Valuation reports',
      ],
    },
    {
      icon: CreditCard,
      title: 'Supplier Payment Terms',
      tag: 'Payables',
      description:
        'Record payment terms, track supplier payables with aging buckets, manage credits and avoid missed payment penalties.',
      highlights: [
        'Payment scheduling',
        'Aging analysis',
        'Credit tracking',
        'Auto-reminders',
      ],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'Step 1',
      title: 'Add Suppliers',
      description:
        'Register suppliers with contact details, GST info, payment terms and link them to products.',
      icon: Handshake,
    },
    {
      number: '02',
      label: 'Step 2',
      title: 'Define BOMs',
      description:
        'Create bills of material for manufactured or kit products with component quantities and costs.',
      icon: FileSpreadsheet,
    },
    {
      number: '03',
      label: 'Step 3',
      title: 'Optimize & Track',
      description:
        'Monitor supplier performance, track payables, and use order smoothing to reduce bullwhip effects.',
      icon: BarChart3,
    },
  ],
  extraFeatures: [
    {
      icon: Star,
      title: 'Supplier Performance',
      description: 'Score suppliers on delivery, quality and pricing with automated scorecards.',
    },
    {
      icon: TrendingDown,
      title: 'Order Smoothing',
      description: 'Detect bullwhip effects and apply EMA smoothing to stabilize order volumes.',
    },
    {
      icon: Scale,
      title: 'Valuation Methods',
      description: 'Switch between FIFO, LIFO and weighted average costing methods anytime.',
    },
    {
      icon: Timer,
      title: 'Aging Buckets',
      description: 'See supplier payables broken down by 30/60/90/120+ day aging periods.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Cost Roll-Up',
      description: 'Auto-calculate BOM costs including components, labor and overhead.',
    },
    {
      icon: Handshake,
      title: 'Credit Management',
      description: 'Track supplier credits and debit notes for accurate reconciliation.',
    },
  ],
  faqs: [
    {
      question: 'Can I assign multiple suppliers to one product?',
      answer:
        'Yes. You can link as many suppliers as needed to each SKU, set a preferred supplier, and compare pricing and lead times side by side.',
    },
    {
      question: 'What valuation methods are supported?',
      answer:
        'EaseInventory supports FIFO, LIFO and weighted average cost methods. You can switch methods and the system recalculates automatically.',
    },
    {
      question: 'How does order smoothing work?',
      answer:
        'The system detects demand amplification (bullwhip effect) across your supply chain and applies exponential moving average smoothing to recommend stable order quantities.',
    },
    {
      question: 'Can I track supplier payment due dates?',
      answer:
        'Absolutely. Set payment terms per supplier, and the system tracks due dates, aging buckets, and sends reminders before payments are due.',
    },
  ],
  cta: {
    icon: Link2,
    title: (
      <>
        Take Control of Your{' '}
        <span className="gradient-text">Supply Chain</span>
      </>
    ),
    subtitle:
      'Reduce costs, improve supplier relationships, and gain full visibility into your supply chain.',
  },
};

export default function SupplyChainPage() {
  return <FeaturePageTemplate config={config} />;
}
