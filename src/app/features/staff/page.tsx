'use client';

import FeaturePageTemplate, { FeaturePageConfig } from '@/components/features/FeaturePageTemplate';
import {
  Zap,
  Target,
  Timer,
  CheckCircle,
  Clock,
  DollarSign,
  ShieldCheck,
  BarChart3,
  UserPlus,
  Smartphone,
  Banknote,
  Calendar,
  Users,
  Shield,
  Gem,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Staff Management',
  hero: {
    title: (
      <>
        Your Team.<br />
        <span className="gradient-text italic">Managed Right.</span>
      </>
    ),
    subtitle:
      'Track attendance, calculate payroll, assign roles, and monitor performance\u2014all from EaseInventory. Complete HR for retail teams without a separate system.',
    trustItems: ['Mobile attendance', 'Auto payroll', 'Custom roles'],
  },
  stats: [
    { value: '80%', label: 'Payroll Time Saved', icon: Zap },
    { value: '100%', label: 'Attendance Accuracy', icon: Target },
    { value: '15min', label: 'Monthly Payroll', icon: Timer },
    { value: '0', label: 'Payroll Errors', icon: CheckCircle },
  ],
  coreFeatures: [
    {
      icon: Clock,
      title: 'Attendance Tracking',
      tag: 'Daily',
      description:
        'Digital check-in/check-out via app or dashboard. Optional geo-tagging to verify location.',
      highlights: ['Mobile check-in', 'Geo-location', 'Late arrival reports', 'Shift management'],
    },
    {
      icon: DollarSign,
      title: 'Payroll Calculation',
      tag: 'Automated',
      description:
        'Automatic salary calculation based on attendance, leaves, and incentives. Monthly payslip generation.',
      highlights: ['Auto calculation', 'Leave deductions', 'Incentive tracking', 'Payslip generation'],
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access',
      tag: 'Security',
      description:
        'Control who sees what. Create roles like Cashier, Store Manager with specific permissions.',
      highlights: ['Custom roles', 'Granular permissions', 'Feature-level control', 'Audit logging'],
    },
    {
      icon: BarChart3,
      title: 'Performance Tracking',
      tag: 'Insights',
      description:
        'Track sales per employee, repairs completed, and targets achieved. Leaderboards and incentives.',
      highlights: ['Sales per employee', 'Target tracking', 'Leaderboards', 'Incentive triggers'],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'ADD STAFF',
      title: 'Add Staff',
      description: 'Create user accounts with roles, salary structure, and permissions.',
      icon: UserPlus,
    },
    {
      number: '02',
      label: 'TRACK ATTENDANCE',
      title: 'Track Attendance',
      description: 'Staff check in via app or dashboard. Late arrivals flagged automatically.',
      icon: Smartphone,
    },
    {
      number: '03',
      label: 'GENERATE PAYROLL',
      title: 'Generate Payroll',
      description: 'One-click payroll calculation with attendance and leave adjustments.',
      icon: Banknote,
    },
  ],
  extraFeatures: [
    { icon: Calendar, title: 'Leave Management', description: 'Casual, sick, earned leave tracking with approval workflow.' },
    { icon: Users, title: 'Pre-built Roles', description: 'Owner, Manager, Cashier, Technician templates ready to use.' },
    { icon: Shield, title: 'Granular Permissions', description: 'Control access at feature level\u2014view, create, edit, delete.' },
    { icon: Target, title: 'Sales Targets', description: 'Set and track individual sales targets with incentive triggers.' },
    { icon: Gem, title: 'Incentive Structures', description: 'Flat bonus, percentage, or tiered incentives on target achievement.' },
    { icon: Timer, title: 'Overtime Tracking', description: 'Automatic overtime calculation based on shift rules.' },
  ],
  faqs: [
    {
      question: 'How does attendance tracking work?',
      answer:
        'Staff check in via the EaseInventory app (punch button) or dashboard. Optionally enable geo-location to verify they are at the store.',
    },
    {
      question: 'Can I set different salary structures?',
      answer:
        'Yes. Each staff member can have fixed salary, daily wages, or hourly rates with per-day deductions and incentives.',
    },
    {
      question: 'How granular are the permissions?',
      answer:
        'Very granular. Control at feature level\u2014a cashier can create invoices but not apply discounts above 10%.',
    },
    {
      question: 'Can staff access EaseInventory on phones?',
      answer:
        'Yes. Fully mobile-responsive. Staff can check-in, create invoices, update inventory based on permissions.',
    },
  ],
  cta: {
    icon: Users,
    title: (
      <>
        Manage Your Team <span className="gradient-text">Better</span>
      </>
    ),
    subtitle: 'From attendance to payroll, simplify HR for your retail business.',
  },
};

export default function StaffPage() {
  return <FeaturePageTemplate config={config} />;
}
