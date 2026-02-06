'use client';

import FeaturePageTemplate, { FeaturePageConfig } from '@/components/features/FeaturePageTemplate';
import {
  Send,
  CheckCircle,
  Zap,
  Star,
  Package,
  Calendar,
  Wrench,
  CreditCard,
  Settings,
  Smartphone,
  Rocket,
  MessageSquare,
  Mail,
  BellRing,
  FileText,
  BarChart3,
  Bell,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Smart Alerts',
  hero: {
    title: (
      <>
        Never Miss<br />
        <span className="gradient-text italic">What Matters.</span>
      </>
    ),
    subtitle:
      'Automated WhatsApp, Email, and push notifications for low stock, repairs, payments, and more. Get the right alert to the right person at the right time.',
    trustItems: ['Official WhatsApp', 'Multi-channel', 'Custom rules'],
  },
  stats: [
    { value: '500K+', label: 'Messages Sent', icon: Send },
    { value: '99.5%', label: 'Delivery Rate', icon: CheckCircle },
    { value: '<30s', label: 'Response Time', icon: Zap },
    { value: '4.8/5', label: 'Satisfaction', icon: Star },
  ],
  coreFeatures: [
    {
      icon: Package,
      title: 'Low Stock Alerts',
      tag: 'Inventory',
      description:
        'Get notified when any product falls below minimum stock level. Configure thresholds per product.',
      highlights: ['Per-product thresholds', 'WhatsApp/Email/Push', 'Auto reorder drafts', 'Batch notifications'],
    },
    {
      icon: Calendar,
      title: 'Expiry Alerts',
      tag: 'Compliance',
      description:
        'Notifications 30, 15, and 7 days before product expiry. FIFO reminders for older stock.',
      highlights: ['Multi-day reminders', 'FIFO/FEFO alerts', 'Batch tracking', 'Dashboard warnings'],
    },
    {
      icon: Wrench,
      title: 'Repair Status Updates',
      tag: 'Service',
      description:
        'Automatic WhatsApp messages to customers when repair status changes. Quotation approvals.',
      highlights: ['Status change alerts', 'Quotation sharing', 'Ready for pickup', 'Customer replies'],
    },
    {
      icon: CreditCard,
      title: 'Payment Reminders',
      tag: 'Finance',
      description:
        'Supplier payment due reminders. Customer credit follow-ups. Recurring invoice alerts.',
      highlights: ['Due date alerts', 'Credit reminders', 'Supplier payments', 'Escalation rules'],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'SET TRIGGERS',
      title: 'Set Triggers',
      description: 'Define what events should trigger notifications—low stock, status changes, due dates.',
      icon: Settings,
    },
    {
      number: '02',
      label: 'CHOOSE CHANNELS',
      title: 'Choose Channels',
      description: 'Select WhatsApp, Email, or Push notifications. Customize message templates.',
      icon: Smartphone,
    },
    {
      number: '03',
      label: 'AUTOMATE',
      title: 'Automate',
      description: 'Notifications sent automatically. Track delivery status and responses in dashboard.',
      icon: Rocket,
    },
  ],
  extraFeatures: [
    { icon: MessageSquare, title: 'WhatsApp Business API', description: 'Official Meta integration with verified business name.' },
    { icon: Mail, title: 'Email Notifications', description: 'HTML-formatted emails with attachments and bulk sending.' },
    { icon: BellRing, title: 'Push Notifications', description: 'Real-time alerts on mobile and desktop devices.' },
    { icon: FileText, title: 'Custom Templates', description: 'Create templates in English, Hindi, or regional languages.' },
    { icon: Zap, title: 'Instant Delivery', description: 'Messages delivered within seconds of trigger event.' },
    { icon: BarChart3, title: 'Scheduled Reports', description: 'Daily business summary emails at your preferred time.' },
  ],
  faqs: [
    {
      question: 'Is WhatsApp integration official?',
      answer: 'Yes, we use the official WhatsApp Business API by Meta. Messages come from your verified business name.',
    },
    {
      question: 'Can I customize notification templates?',
      answer: 'Absolutely. Customize message text, add your store name, include product details, and even promotional content.',
    },
    {
      question: 'How many notifications can I send?',
      answer: 'Starter: 50 WhatsApp/month. Business: 200/month. Professional: Unlimited. Email and push are unlimited on all plans.',
    },
    {
      question: 'Can I send notifications in Hindi?',
      answer: 'Yes! Create templates in English, Hindi, or any regional language. Full Unicode support.',
    },
  ],
  cta: {
    icon: Bell,
    title: (
      <>
        Stay <span className="gradient-text italic">Informed</span>, Stay Ahead
      </>
    ),
    subtitle: 'Set up smart alerts in minutes and never worry about missing important business events.',
  },
};

export default function AlertsPage() {
  return <FeaturePageTemplate config={config} />;
}
