'use client';

import FeaturePageTemplate, {
  type FeaturePageConfig,
} from '@/components/features/FeaturePageTemplate';
import {
  Target,
  Zap,
  Search,
  TrendingUp,
  ScanBarcode,
  Hash,
  MapPin,
  DollarSign,
  Upload,
  Settings,
  Rocket,
  Calendar,
  History,
  Bell,
  BarChart3,
  Handshake,
  Lightbulb,
  PackageSearch,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Precision Inventory',
  hero: {
    title: (
      <>
        Know Your Stock.
        <br />
        <span className="gradient-text italic">Down to the Last Unit.</span>
      </>
    ),
    subtitle:
      'Complete visibility into your stock. Track every item with serial numbers, scan barcodes with your phone, get low-stock alerts, and analyze profitability in real-time.',
    trustItems: ['No credit card', '5 min setup', 'Free import'],
  },
  stats: [
    { value: '99.9%', label: 'Inventory Accuracy', icon: Target },
    { value: '50%', label: 'Time Saved', icon: Zap },
    { value: '<2s', label: 'Search Speed', icon: Search },
    { value: '₹0', label: 'Stockout Losses', icon: TrendingUp },
  ],
  coreFeatures: [
    {
      icon: ScanBarcode,
      title: 'Barcode & QR Scanning',
      tag: 'Mobile',
      description:
        'Scan products instantly using your phone camera. Supports EAN-13, UPC, Code-128, and QR codes.',
      highlights: [
        'Camera-based scanning',
        '7+ barcode formats',
        'Print custom labels',
        'Bulk generation',
      ],
    },
    {
      icon: Hash,
      title: 'Serial Number Tracking',
      tag: 'Precision',
      description:
        'Track individual units with unique serial numbers. Perfect for electronics and high-value items.',
      highlights: [
        'Unique unit IDs',
        'Warranty tracking',
        'History per unit',
        'Recall management',
      ],
    },
    {
      icon: MapPin,
      title: 'Multi-Location Management',
      tag: 'Scale',
      description:
        'Manage inventory across multiple stores and warehouses. Transfer stock with full audit trails.',
      highlights: [
        'Unlimited locations',
        'Inter-location transfers',
        'Location-wise reports',
        'Centralized view',
      ],
    },
    {
      icon: DollarSign,
      title: 'Automated Profit Analysis',
      tag: 'Insights',
      description:
        'Know your margins instantly. Automatic calculation of cost, sale price, and profit percentage.',
      highlights: [
        'Real-time tracking',
        'Margin alerts',
        'Cost history',
        'Pricing suggestions',
      ],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'Step 1',
      title: 'Import Products',
      description:
        'Upload existing inventory via Excel or add products manually with our guided wizard.',
      icon: Upload,
    },
    {
      number: '02',
      label: 'Step 2',
      title: 'Configure Locations',
      description:
        'Set up stores, warehouses, and define minimum stock levels for each product.',
      icon: Settings,
    },
    {
      number: '03',
      label: 'Step 3',
      title: 'Start Tracking',
      description:
        'Scan barcodes, record purchases, process sales. Every movement tracked in real-time.',
      icon: Rocket,
    },
  ],
  extraFeatures: [
    {
      icon: Calendar,
      title: 'Batch & Expiry Tracking',
      description:
        'Track batch numbers and expiry dates with FIFO/FEFO alerts.',
    },
    {
      icon: History,
      title: 'Stock Movement History',
      description:
        'Complete audit trail of every stock movement with user details.',
    },
    {
      icon: Bell,
      title: 'Low Stock Alerts',
      description:
        'Automated alerts when inventory falls below minimum levels.',
    },
    {
      icon: BarChart3,
      title: 'Inventory Analytics',
      description:
        'Identify slow-moving items, fast sellers, and dead stock.',
    },
    {
      icon: Handshake,
      title: 'Consignment Support',
      description:
        'Track consignment inventory with supplier settlement tracking.',
    },
    {
      icon: Lightbulb,
      title: 'Reorder Suggestions',
      description:
        'Smart suggestions based on sales velocity and lead times.',
    },
  ],
  faqs: [
    {
      question: 'Can I import my existing inventory from Excel?',
      answer:
        'Yes! EaseInventory supports bulk import from Excel and CSV files. Our guided import wizard maps your columns automatically.',
    },
    {
      question: 'How does serial number tracking work?',
      answer:
        'When you receive stock, assign unique serial numbers to each unit. These are tracked through sales, repairs, and returns.',
    },
    {
      question: 'Can I manage multiple stores from one account?',
      answer:
        'Absolutely. Add unlimited locations and track inventory at each. Transfer stock between locations with full documentation.',
    },
    {
      question: 'Do I need special hardware for barcode scanning?',
      answer:
        'No! EaseInventory uses your phone or tablet camera. You can also use traditional USB barcode scanners if you prefer.',
    },
  ],
  cta: {
    icon: PackageSearch,
    title: (
      <>
        Take Control of Your{' '}
        <span className="gradient-text">Inventory</span> Today
      </>
    ),
    subtitle:
      'Join thousands of Indian retailers who have eliminated stockouts and increased profits.',
  },
};

export default function InventoryPage() {
  return <FeaturePageTemplate config={config} />;
}
