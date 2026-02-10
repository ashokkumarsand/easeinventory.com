'use client';

import FeaturePageTemplate, {
  type FeaturePageConfig,
} from '@/components/features/FeaturePageTemplate';
import {
  Bot,
  RefreshCw,
  FileBarChart,
  Webhook,
  Layers,
  Zap,
  Settings,
  Clock,
  Download,
  Bell,
  ListChecks,
  Rocket,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Automation',
  hero: {
    title: (
      <>
        Automate the
        <br />
        <span className="gradient-text italic">Repetitive Stuff.</span>
      </>
    ),
    subtitle:
      'Set up workflow rules, auto-reorder triggers, scheduled reports, webhooks and bulk operations — so your team can focus on growth.',
    trustItems: ['No-code rules', 'Scheduled exports', 'Webhook integration'],
  },
  stats: [
    { value: '80%', label: 'Less Manual Work', icon: Bot },
    { value: '24/7', label: 'Always Running', icon: Clock },
    { value: '100+', label: 'Trigger Events', icon: Zap },
    { value: '0', label: 'Missed Reorders', icon: RefreshCw },
  ],
  coreFeatures: [
    {
      icon: Zap,
      title: 'Workflow Automation Rules',
      tag: 'Rules',
      description:
        'Create if-then rules that trigger actions automatically. Low stock? Auto-create a PO. New order? Notify the warehouse team.',
      highlights: [
        'Condition builder',
        'Multiple triggers',
        'Chained actions',
        'Custom schedules',
      ],
    },
    {
      icon: RefreshCw,
      title: 'Auto-Reorder Presets',
      tag: 'Purchasing',
      description:
        'Configure reorder rules per product or category. When stock drops below the threshold, purchase orders are created automatically.',
      highlights: [
        'Threshold triggers',
        'Preferred suppliers',
        'Order quantity calc',
        'Approval workflow',
      ],
    },
    {
      icon: FileBarChart,
      title: 'Report Builder & Exports',
      tag: 'Reports',
      description:
        'Build custom reports with drag-and-drop. Schedule daily, weekly or monthly exports delivered to your email as PDF or Excel.',
      highlights: [
        'Custom columns',
        'Filter & group',
        'Scheduled delivery',
        'PDF & Excel export',
      ],
    },
    {
      icon: Webhook,
      title: 'Webhooks & API Events',
      tag: 'Integration',
      description:
        'Push real-time events to external systems via webhooks. Integrate with Zapier, your ERP, or custom applications.',
      highlights: [
        'Event subscriptions',
        'Retry logic',
        'Delivery logs',
        'Custom payloads',
      ],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'Step 1',
      title: 'Define Rules',
      description:
        'Use the no-code rule builder to set triggers, conditions and actions for your automation.',
      icon: Settings,
    },
    {
      number: '02',
      label: 'Step 2',
      title: 'Test & Activate',
      description:
        'Preview rule behavior with test data, then activate. Rules run continuously in the background.',
      icon: Rocket,
    },
    {
      number: '03',
      label: 'Step 3',
      title: 'Monitor & Refine',
      description:
        'Track rule execution history, review outcomes, and fine-tune thresholds as your business evolves.',
      icon: FileBarChart,
    },
  ],
  extraFeatures: [
    {
      icon: Layers,
      title: 'Bulk Operations',
      description: 'Update prices, categories or stock levels for thousands of products at once.',
    },
    {
      icon: Download,
      title: 'Scheduled Exports',
      description: 'Auto-export reports on a daily, weekly or monthly schedule to your inbox.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get alerted via email or WhatsApp when automation rules trigger actions.',
    },
    {
      icon: ListChecks,
      title: 'Activity Feed',
      description: 'Complete log of all automated actions with timestamps and outcomes.',
    },
    {
      icon: Clock,
      title: 'Cron Scheduling',
      description: 'Run automation rules on custom schedules — hourly, daily or custom cron.',
    },
    {
      icon: Settings,
      title: 'Approval Workflows',
      description: 'Require manager approval before high-value automated actions execute.',
    },
  ],
  faqs: [
    {
      question: 'Do I need coding skills to set up automation?',
      answer:
        'No. The rule builder uses a visual interface where you select triggers, conditions and actions from dropdowns. No code required.',
    },
    {
      question: 'Can I set up auto-reorder for specific products?',
      answer:
        'Yes. You can create reorder presets per product, category or supplier. Each preset has its own threshold, quantity formula and preferred supplier.',
    },
    {
      question: 'What report formats are supported?',
      answer:
        'Reports can be exported as PDF, Excel (XLSX) and CSV. Scheduled reports are delivered as email attachments.',
    },
    {
      question: 'How do webhooks work?',
      answer:
        'You register a URL endpoint and select which events to subscribe to (e.g., order.created, stock.low). EaseInventory sends a JSON payload to your URL in real-time with automatic retries on failure.',
    },
  ],
  cta: {
    icon: Bot,
    title: (
      <>
        Put Your Operations on{' '}
        <span className="gradient-text">Autopilot</span>
      </>
    ),
    subtitle:
      'Automate repetitive tasks and free your team to focus on growing your business.',
  },
};

export default function AutomationPage() {
  return <FeaturePageTemplate config={config} />;
}
