'use client';

import FeaturePageTemplate, {
  type FeaturePageConfig,
} from '@/components/features/FeaturePageTemplate';
import {
  Truck,
  MapPin,
  ArrowLeftRight,
  Warehouse,
  Target,
  BarChart3,
  Settings,
  Rocket,
  Gauge,
  Map,
  Package,
  Scale,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Multi-Location',
  hero: {
    title: (
      <>
        One Platform.
        <br />
        <span className="gradient-text italic">Every Location.</span>
      </>
    ),
    subtitle:
      'Manage stock across multiple warehouses and stores. Transfer inventory, optimize placement, and maximize capacity — all in real-time.',
    trustItems: ['Unlimited locations', 'Live transfers', 'Capacity planning'],
  },
  stats: [
    { value: '5+', label: 'Locations Managed', icon: MapPin },
    { value: '20%', label: 'Less Excess Stock', icon: Target },
    { value: '2x', label: 'Faster Transfers', icon: ArrowLeftRight },
    { value: '99%', label: 'Capacity Utilization', icon: Gauge },
  ],
  coreFeatures: [
    {
      icon: ArrowLeftRight,
      title: 'Inter-Location Transfers',
      tag: 'Transfers',
      description:
        'Move stock between locations with approval workflows, in-transit tracking and auto-updating stock levels at both ends.',
      highlights: [
        'Transfer requests',
        'Approval workflow',
        'In-transit tracking',
        'Auto stock update',
      ],
    },
    {
      icon: Truck,
      title: 'Lateral Transshipment',
      tag: 'Optimize',
      description:
        'Automatically suggest lateral stock transfers between locations to avoid stockouts without waiting for the central warehouse.',
      highlights: [
        'Auto-suggestions',
        'Demand matching',
        'Cost optimization',
        'Priority routing',
      ],
    },
    {
      icon: Target,
      title: 'Inventory Placement Optimizer',
      tag: 'Strategy',
      description:
        'Use demand data to recommend optimal stock placement across your network. Put the right products in the right locations.',
      highlights: [
        'Demand-based placement',
        'Network optimization',
        'SKU-level plans',
        'Scenario modeling',
      ],
    },
    {
      icon: Warehouse,
      title: 'Warehouse Capacity Management',
      tag: 'Capacity',
      description:
        'Track storage utilization by zone, set capacity limits, and get alerts before your warehouse runs out of space.',
      highlights: [
        'Zone management',
        'Capacity alerts',
        'Space utilization',
        'Expansion planning',
      ],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'Step 1',
      title: 'Add Locations',
      description:
        'Register your warehouses, stores and distribution centers with addresses and storage capacity.',
      icon: MapPin,
    },
    {
      number: '02',
      label: 'Step 2',
      title: 'Configure Rules',
      description:
        'Set transfer approval workflows, capacity limits and minimum stock levels per location.',
      icon: Settings,
    },
    {
      number: '03',
      label: 'Step 3',
      title: 'Optimize Network',
      description:
        'Let the placement optimizer and transshipment engine keep your network balanced automatically.',
      icon: Rocket,
    },
  ],
  extraFeatures: [
    {
      icon: Map,
      title: 'Network Visualization',
      description: 'See all your locations on a map with stock levels and transfer flows.',
    },
    {
      icon: Package,
      title: 'Stock at Location',
      description: 'Drill down into stock levels at each location with bin-level detail.',
    },
    {
      icon: BarChart3,
      title: 'Location Analytics',
      description: 'Compare performance metrics across locations — turnover, fill rate, costs.',
    },
    {
      icon: Scale,
      title: 'Rebalancing Alerts',
      description: 'Get notified when stock imbalances could cause stockouts or overstocking.',
    },
    {
      icon: Gauge,
      title: 'Utilization Reports',
      description: 'Track warehouse capacity utilization trends over time.',
    },
    {
      icon: ArrowLeftRight,
      title: 'Transfer History',
      description: 'Complete audit trail of all inter-location stock movements.',
    },
  ],
  faqs: [
    {
      question: 'How many locations can I add?',
      answer:
        'The Basic plan supports 1 location. Business supports 5 locations, and Enterprise has unlimited locations. You can purchase add-on credits for extra capacity.',
    },
    {
      question: 'What happens to stock during a transfer?',
      answer:
        'Stock is deducted from the source location and marked as "in transit". Once the receiving location confirms receipt, stock is added there. Both movements are fully audited.',
    },
    {
      question: 'Can I set up automatic transfers?',
      answer:
        'Yes. The lateral transshipment engine can automatically suggest and create transfers when it detects that one location has excess stock and another is running low.',
    },
    {
      question: 'How does capacity management work?',
      answer:
        'You define storage capacity per warehouse zone. The system tracks current utilization and alerts you when zones approach capacity limits, helping you plan expansions.',
    },
  ],
  cta: {
    icon: Truck,
    title: (
      <>
        Unify Your{' '}
        <span className="gradient-text">Multi-Location Network</span>
      </>
    ),
    subtitle:
      'Get complete visibility and control across every warehouse and store.',
  },
};

export default function MultiLocationPage() {
  return <FeaturePageTemplate config={config} />;
}
