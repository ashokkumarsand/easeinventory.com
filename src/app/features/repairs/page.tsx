'use client';

import FeaturePageTemplate, { FeaturePageConfig } from '@/components/features/FeaturePageTemplate';
import {
  Zap,
  Lock,
  Star,
  Rocket,
  ClipboardList,
  UserCog,
  MessageSquare,
  Camera,
  Smartphone,
  Search,
  CheckCircle,
  Timer,
  Puzzle,
  BarChart3,
  Shield,
  Settings,
  Wrench,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Repair Management',
  hero: {
    title: (
      <>
        Repair Chaos?<br />
        <span className="gradient-text italic">Consider It Fixed.</span>
      </>
    ),
    subtitle:
      'Track every repair from intake to delivery. Assign technicians, document with photos, auto-notify customers via WhatsApp, and analyze service performance.',
    trustItems: ['Mobile & electronics', 'WhatsApp built-in', 'Photo documentation'],
  },
  stats: [
    { value: '40%', label: 'Faster Turnaround', icon: Zap },
    { value: '0', label: 'Lost Devices', icon: Lock },
    { value: '95%', label: 'Customer Satisfaction', icon: Star },
    { value: '2x', label: 'Team Efficiency', icon: Rocket },
  ],
  coreFeatures: [
    {
      icon: ClipboardList,
      title: 'Smart Ticket Management',
      tag: 'Organize',
      description:
        'Create detailed repair tickets with device info, IMEI/serial numbers, fault description, and condition photos.',
      highlights: ['Auto ticket numbers', 'Priority levels', 'Multiple devices', 'Linked to inventory'],
    },
    {
      icon: UserCog,
      title: 'Technician Assignment',
      tag: 'Assign',
      description:
        'Assign repairs to technicians based on skill and workload. Track time spent per repair.',
      highlights: ['Skill-based assignment', 'Time tracking', 'Daily workload view', 'Performance metrics'],
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Notifications',
      tag: 'Communicate',
      description:
        'Automatic WhatsApp messages to customers at every stage. Quotation approval and pickup alerts.',
      highlights: ['Status change alerts', 'Quotation sharing', 'Payment reminders', 'Pickup notifications'],
    },
    {
      icon: Camera,
      title: 'Photo Documentation',
      tag: 'Protect',
      description:
        'Attach before and after photos to every repair. Protect against false damage claims.',
      highlights: ['Before/after photos', 'Damage documentation', 'Cloud storage', 'Easy retrieval'],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'DEVICE INTAKE',
      title: 'Device Intake',
      description:
        'Create ticket in 30 seconds with device details, problem description, and condition photos.',
      icon: Smartphone,
    },
    {
      number: '02',
      label: 'DIAGNOSIS & QUOTE',
      title: 'Diagnosis & Quote',
      description:
        'Technician diagnoses, adds parts needed. WhatsApp quotation sent to customer.',
      icon: Search,
    },
    {
      number: '03',
      label: 'REPAIR & DELIVER',
      title: 'Repair & Deliver',
      description:
        'Repair after approval, quality check, notify customer. Generate invoice with warranty.',
      icon: CheckCircle,
    },
  ],
  extraFeatures: [
    { icon: Timer, title: 'TAT Tracking', description: 'Monitor turnaround time with SLA alerts and escalations.' },
    { icon: Puzzle, title: 'Parts Integration', description: 'Link repairs to inventory for spare parts tracking.' },
    { icon: BarChart3, title: 'Repair Analytics', description: 'Common issues, success rates, revenue reports.' },
    { icon: Shield, title: 'Warranty Tracking', description: 'Internal and manufacturer warranty management.' },
    { icon: Settings, title: 'Custom Workflow', description: 'Configure repair statuses to match your process.' },
    { icon: Zap, title: 'Quick Actions', description: 'One-click status updates and customer notifications.' },
  ],
  faqs: [
    {
      question: 'Can I track repairs for multiple device types?',
      answer:
        'Yes! Handles mobiles, laptops, TVs, ACs, appliances, and any other device type. Customize fields per category.',
    },
    {
      question: 'How do WhatsApp notifications work?',
      answer:
        'Official WhatsApp Business API integration. Messages sent automatically when ticket status changes. Customers can respond directly.',
    },
    {
      question: 'Can technicians access on their phones?',
      answer:
        'Absolutely. Fully mobile-responsive. Update status, add notes, upload photos from any device.',
    },
    {
      question: 'How is repair revenue calculated?',
      answer:
        'Each ticket includes labor charges, spare parts (linked to inventory cost), and additional fees. Profit calculated automatically.',
    },
  ],
  cta: {
    icon: Wrench,
    title: (
      <>
        Ready to Streamline Your <span className="gradient-text italic">Repairs?</span>
      </>
    ),
    subtitle:
      'Join service centers across India who have reduced turnaround time and increased satisfaction.',
  },
};

export default function RepairsPage() {
  return <FeaturePageTemplate config={config} />;
}
