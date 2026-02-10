'use client';

import FeaturePageTemplate, {
  type FeaturePageConfig,
} from '@/components/features/FeaturePageTemplate';
import {
  ShoppingCart,
  ClipboardList,
  Truck,
  RotateCcw,
  Layers,
  FileText,
  Package,
  Settings,
  Rocket,
  ScanBarcode,
  Timer,
  ArrowLeftRight,
  Warehouse,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Warehouse & Orders',
  hero: {
    title: (
      <>
        From Order to
        <br />
        <span className="gradient-text italic">Delivery. Seamless.</span>
      </>
    ),
    subtitle:
      'Manage the full order lifecycle — sales orders, procurement, shipping, returns and wave planning — in one unified workflow.',
    trustItems: ['14-day free trial', 'No credit card', 'Multi-carrier support'],
  },
  stats: [
    { value: '3x', label: 'Faster Fulfillment', icon: Truck },
    { value: '99%', label: 'Order Accuracy', icon: ClipboardList },
    { value: '40%', label: 'Less Manual Work', icon: Timer },
    { value: '5+', label: 'Carrier Integrations', icon: Package },
  ],
  coreFeatures: [
    {
      icon: ShoppingCart,
      title: 'Sales Order Management',
      tag: 'Orders',
      description:
        'Create, track and fulfill sales orders with auto-generated order numbers, status tracking and payment reconciliation.',
      highlights: [
        'Auto order numbering',
        'Status workflows',
        'Payment tracking',
        'Bulk order creation',
      ],
    },
    {
      icon: FileText,
      title: 'Purchase Orders & Procurement',
      tag: 'Inbound',
      description:
        'Generate POs, track supplier deliveries with goods receipts, and manage partial receiving with full audit trails.',
      highlights: [
        'PO PDF generation',
        'Goods receipt notes',
        'Partial receiving',
        'Supplier integration',
      ],
    },
    {
      icon: Truck,
      title: 'Shipping & Carrier Integration',
      tag: 'Fulfillment',
      description:
        'Connect with Shiprocket and other carriers. Auto-generate AWBs, track shipments, and manage COD remittances.',
      highlights: [
        'Shiprocket integration',
        'AWB generation',
        'Live tracking',
        'COD management',
      ],
    },
    {
      icon: RotateCcw,
      title: 'Returns & NDR Management',
      tag: 'Returns',
      description:
        'Handle return requests, inspect returned goods, process refunds and manage non-delivery reports — all from one dashboard.',
      highlights: [
        'Return workflows',
        'Quality inspection',
        'Refund processing',
        'NDR resolution',
      ],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'Step 1',
      title: 'Create Orders',
      description:
        'Create sales orders or purchase orders. Auto-assign order numbers and set fulfillment priority.',
      icon: ClipboardList,
    },
    {
      number: '02',
      label: 'Step 2',
      title: 'Pick & Ship',
      description:
        'Generate pick lists, pack orders, and dispatch via your preferred carrier with one click.',
      icon: ScanBarcode,
    },
    {
      number: '03',
      label: 'Step 3',
      title: 'Track & Deliver',
      description:
        'Monitor shipments in real-time. Handle NDR, returns and COD collections automatically.',
      icon: Rocket,
    },
  ],
  extraFeatures: [
    {
      icon: Layers,
      title: 'Wave Planning',
      description: 'Group orders into waves for efficient batch picking and processing.',
    },
    {
      icon: ScanBarcode,
      title: 'Pick Lists',
      description: 'Auto-generated pick lists optimized by warehouse zone and location.',
    },
    {
      icon: ArrowLeftRight,
      title: 'COD Remittance',
      description: 'Track and reconcile cash-on-delivery collections from carriers.',
    },
    {
      icon: Settings,
      title: 'Carrier Accounts',
      description: 'Configure multiple carrier accounts with API credentials in one place.',
    },
    {
      icon: Timer,
      title: 'SLA Tracking',
      description: 'Monitor fulfillment SLAs and get alerts for at-risk orders.',
    },
    {
      icon: FileText,
      title: 'Goods Receipt Notes',
      description: 'Record inbound deliveries with quantity checks and quality notes.',
    },
  ],
  faqs: [
    {
      question: 'Which carriers are supported?',
      answer:
        'EaseInventory integrates with Shiprocket (which covers 25+ couriers), and supports a mock carrier for testing. More direct integrations are coming soon.',
    },
    {
      question: 'Can I handle partial shipments?',
      answer:
        'Yes. You can partially fulfill a sales order and ship in multiple batches. Each shipment is tracked independently.',
    },
    {
      question: 'How do returns work?',
      answer:
        'Customers or your team can initiate return requests. You approve, receive and inspect the return, then process a refund or restock the items.',
    },
    {
      question: 'What is wave planning?',
      answer:
        'Wave planning lets you group multiple orders into a single batch for efficient picking. This reduces warehouse walks and speeds up fulfillment.',
    },
  ],
  cta: {
    icon: Warehouse,
    title: (
      <>
        Streamline Your{' '}
        <span className="gradient-text">Warehouse Operations</span>
      </>
    ),
    subtitle:
      'From order creation to last-mile delivery — manage it all from one dashboard.',
  },
};

export default function WarehousePage() {
  return <FeaturePageTemplate config={config} />;
}
