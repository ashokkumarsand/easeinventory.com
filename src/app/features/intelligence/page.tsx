'use client';

import FeaturePageTemplate, {
  type FeaturePageConfig,
} from '@/components/features/FeaturePageTemplate';
import {
  LineChart,
  TrendingUp,
  Shield,
  BarChart3,
  PieChart,
  Target,
  Lightbulb,
  BrainCircuit,
  Layers,
  AlertTriangle,
  Gauge,
  Sparkles,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Intelligence',
  hero: {
    title: (
      <>
        Data-Driven
        <br />
        <span className="gradient-text italic">Inventory Decisions.</span>
      </>
    ),
    subtitle:
      'Demand forecasting, safety stock optimization, ABC/XYZ classification and assortment planning — powered by your real data.',
    trustItems: ['No data science required', 'Real-time insights', 'Actionable alerts'],
  },
  stats: [
    { value: '25%', label: 'Less Dead Stock', icon: TrendingUp },
    { value: '95%', label: 'Service Level', icon: Target },
    { value: '40%', label: 'Fewer Stockouts', icon: Shield },
    { value: '10x', label: 'Faster Analysis', icon: Gauge },
  ],
  coreFeatures: [
    {
      icon: LineChart,
      title: 'Demand Forecasting',
      tag: 'Predict',
      description:
        'Forecast future demand using historical sales data with trend detection, seasonality analysis and confidence intervals.',
      highlights: [
        'Time-series models',
        'Seasonal patterns',
        'Confidence ranges',
        'Per-product forecasts',
      ],
    },
    {
      icon: Shield,
      title: 'Safety Stock Optimization',
      tag: 'Protect',
      description:
        'Calculate optimal safety stock levels based on demand variability, lead time uncertainty and target service levels.',
      highlights: [
        'Service level targets',
        'Lead time variance',
        'Dynamic calculation',
        'Reorder points',
      ],
    },
    {
      icon: BarChart3,
      title: 'ABC/XYZ Classification',
      tag: 'Classify',
      description:
        'Automatically categorize products by revenue contribution (ABC) and demand predictability (XYZ) for differentiated management.',
      highlights: [
        'Revenue-based ABC',
        'Variability XYZ',
        '9-segment matrix',
        'Strategy per class',
      ],
    },
    {
      icon: PieChart,
      title: 'Assortment Planning',
      tag: 'Optimize',
      description:
        'Score products, track lifecycle stages, monitor category health and get data-driven add/remove suggestions for your assortment.',
      highlights: [
        'Product scoring',
        'Lifecycle tracking',
        'Category health',
        'Smart suggestions',
      ],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'Step 1',
      title: 'Collect Data',
      description:
        'EaseInventory automatically analyzes your sales history, purchase data and stock movements.',
      icon: BrainCircuit,
    },
    {
      number: '02',
      label: 'Step 2',
      title: 'Generate Insights',
      description:
        'The system classifies products, forecasts demand and calculates optimal stock levels.',
      icon: Lightbulb,
    },
    {
      number: '03',
      label: 'Step 3',
      title: 'Act on Recommendations',
      description:
        'Follow reorder suggestions, adjust safety stock and optimize your product assortment.',
      icon: Target,
    },
  ],
  extraFeatures: [
    {
      icon: Lightbulb,
      title: 'Reorder Suggestions',
      description: 'Smart reorder recommendations based on forecasted demand and current stock.',
    },
    {
      icon: AlertTriangle,
      title: 'Dead Stock Detection',
      description: 'Identify products with no movement and get liquidation recommendations.',
    },
    {
      icon: Layers,
      title: 'Perishable Tracking',
      description: 'FEFO alerts for items approaching expiry with markdown suggestions.',
    },
    {
      icon: Gauge,
      title: 'KPI Dashboard',
      description: 'Track inventory turnover, fill rate, carrying cost and stockout frequency.',
    },
    {
      icon: Sparkles,
      title: 'Decision Nudges',
      description: 'Contextual suggestions that surface the right action at the right time.',
    },
    {
      icon: TrendingUp,
      title: 'Lost Sales Tracking',
      description: 'Measure revenue lost to stockouts and quantify the cost of under-stocking.',
    },
  ],
  faqs: [
    {
      question: 'How much historical data do I need for forecasting?',
      answer:
        'The system works with as little as 30 days of data, but accuracy improves with 90+ days of sales history. Seasonal patterns require at least one full cycle.',
    },
    {
      question: 'What is ABC/XYZ classification?',
      answer:
        'ABC classifies products by revenue contribution (A = top 80%, B = next 15%, C = bottom 5%). XYZ classifies by demand predictability (X = stable, Y = variable, Z = erratic). Together they form a 9-segment matrix for strategy.',
    },
    {
      question: 'Can I set different service levels per product?',
      answer:
        'Yes. You can set service level targets (e.g., 95% or 99%) per product or category. Safety stock calculations adjust accordingly.',
    },
    {
      question: 'Does the system suggest which products to add or remove?',
      answer:
        'Yes. The assortment planner scores products and identifies candidates for addition, growth, maintenance or phase-out based on multiple metrics.',
    },
  ],
  cta: {
    icon: LineChart,
    title: (
      <>
        Make Smarter{' '}
        <span className="gradient-text">Inventory Decisions</span>
      </>
    ),
    subtitle:
      'Stop guessing. Let data drive your purchasing, stocking and assortment decisions.',
  },
};

export default function IntelligencePage() {
  return <FeaturePageTemplate config={config} />;
}
