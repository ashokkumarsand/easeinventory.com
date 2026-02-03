'use client';

import { Button, Card, CardBody, Chip, Progress } from '@heroui/react';
import { ArrowRight, Calendar, Check, Clock, DollarSign, Lock, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

const coreFeatures = [
  {
    icon: Clock,
    title: 'Attendance Tracking',
    description: 'Digital check-in/check-out via app or dashboard. Optional geo-tagging to verify location. Late arrival and early departure reports.',
    highlights: ['Mobile check-in', 'Geo-location tagging', 'Late arrival reports', 'Shift management'],
  },
  {
    icon: DollarSign,
    title: 'Payroll Calculation',
    description: 'Automatic salary calculation based on attendance, leaves, and incentives. Monthly payslip generation. Bank-ready reports.',
    highlights: ['Auto calculation', 'Leave deductions', 'Incentive tracking', 'Payslip generation'],
  },
  {
    icon: Lock,
    title: 'Role-Based Access',
    description: 'Control who sees what. Create roles like Cashier, Store Manager, Inventory Staff with specific permissions.',
    highlights: ['Custom roles', 'Granular permissions', 'Feature-level control', 'Audit logging'],
  },
  {
    icon: TrendingUp,
    title: 'Performance Tracking',
    description: 'Track sales per employee, repairs completed, and targets achieved. Leaderboards and performance incentives.',
    highlights: ['Sales per employee', 'Target tracking', 'Leaderboards', 'Incentive triggers'],
  },
];

const permissionModules = [
  { module: 'Inventory', permissions: ['View stock', 'Add products', 'Edit prices', 'Delete products', 'Stock adjustments'] },
  { module: 'Billing', permissions: ['Create invoices', 'Apply discounts', 'Void invoices', 'View all invoices', 'Refunds'] },
  { module: 'Repairs', permissions: ['Create tickets', 'Assign technicians', 'Update status', 'View all repairs', 'Quotations'] },
  { module: 'Reports', permissions: ['View sales reports', 'View inventory reports', 'Export data', 'Financial reports'] },
  { module: 'Settings', permissions: ['Manage staff', 'Business settings', 'Integrations', 'Billing/subscription'] },
];

const roleTemplates = [
  { role: 'Owner/Admin', description: 'Full access to everything', color: 'danger' },
  { role: 'Store Manager', description: 'All except billing/subscription settings', color: 'warning' },
  { role: 'Cashier', description: 'Billing, basic inventory view', color: 'success' },
  { role: 'Inventory Staff', description: 'Full inventory, no billing', color: 'primary' },
  { role: 'Technician', description: 'Repair tickets only', color: 'secondary' },
];

const leaveTypes = [
  { type: 'Casual Leave', days: '12/year', description: 'For personal matters' },
  { type: 'Sick Leave', days: '6/year', description: 'Medical reasons' },
  { type: 'Earned Leave', days: 'Based on tenure', description: 'Carry forward allowed' },
  { type: 'Holidays', days: 'As per calendar', description: 'National/regional holidays' },
];

const hrStats = [
  { value: '80%', label: 'Payroll Time Saved', desc: 'vs manual calculation' },
  { value: '100%', label: 'Attendance Accuracy', desc: 'With digital tracking' },
  { value: '15min', label: 'Monthly Payroll', desc: 'From calculation to payslip' },
  { value: '0', label: 'Payroll Errors', desc: 'With automated deductions' },
];

const faqs = [
  {
    question: 'How does attendance tracking work?',
    answer: 'Staff can check in via the EaseInventory app (punch in button) or from the dashboard. You can optionally enable geo-location to verify they are at the store. Check-in/out times are recorded for payroll calculation.',
  },
  {
    question: 'Can I set different salary structures for different staff?',
    answer: 'Yes. Each staff member can have their own salary structure: fixed salary, daily wages, or hourly rates. You can also define per-day deductions for absence and incentive structures.',
  },
  {
    question: 'How granular are the permissions?',
    answer: "Very granular. You can control access at the feature level. For example, a cashier can create invoices but not apply discounts above 10%. A manager can edit inventory but not delete it. It's fully customizable.",
  },
  {
    question: 'Can staff access EaseInventory on their phones?',
    answer: 'Yes. EaseInventory is fully mobile-responsive. Staff can use their phones to check-in, create invoices, update inventory, and more—based on their assigned permissions.',
  },
  {
    question: 'How do incentives work?',
    answer: 'You can set sales targets for each staff member. When they exceed targets, incentives are automatically calculated and added to their payroll. Common models: flat bonus, percentage of sales above target, tiered incentives.',
  },
];

const pricingComparison = [
  { feature: 'Staff Members', starter: '3', business: '10', professional: '25+' },
  { feature: 'Attendance Tracking', starter: '✓', business: '✓', professional: '✓' },
  { feature: 'Geo-Location Check-in', starter: '—', business: '✓', professional: '✓' },
  { feature: 'Leave Management', starter: '—', business: '✓', professional: '✓' },
  { feature: 'Payroll Calculation', starter: '—', business: '✓', professional: '✓' },
  { feature: 'Performance Tracking', starter: '—', business: '—', professional: '✓' },
  { feature: 'Custom Roles', starter: '2', business: '5', professional: 'Unlimited' },
];

export default function StaffManagementPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent" />
        <div className="absolute top-20 right-20 w-80 h-80 bg-secondary/10 rounded-full blur-[150px]" />
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-6">
                <Users size={14} className="text-secondary" />
                <span className="text-xs font-black uppercase tracking-widest text-secondary">Human Resources</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                Your Team.<br />
                <span className="text-secondary">Managed Right.</span>
              </h1>
              
              <p className="text-lg text-foreground/60 leading-relaxed mb-8 max-w-xl">
                Track attendance, calculate payroll, assign roles, and monitor performance—all from 
                EaseInventory. Complete HR for retail teams without a separate HR system.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button as={Link} href="/register" color="secondary" size="lg" className="font-black" radius="full">
                  Start 14-Day Free Trial
                  <ArrowRight size={18} />
                </Button>
                <Button as={Link} href="#features" variant="bordered" size="lg" className="font-bold" radius="full">
                  Explore Features
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-foreground/60">Mobile attendance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-foreground/60">Auto payroll</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-foreground/60">Custom roles</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {hrStats.map((stat) => (
                <Card key={stat.label} className="modern-card p-6">
                  <div className="text-3xl font-black text-secondary mb-1">{stat.value}</div>
                  <div className="text-sm font-bold text-foreground/50">{stat.label}</div>
                  <p className="text-xs text-foreground/40 mt-2">{stat.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="secondary" variant="flat" className="mb-4">Core Features</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Complete Staff Management
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreFeatures.map((feature) => (
              <Card key={feature.title} className="modern-card overflow-hidden">
                <CardBody className="p-8">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <feature.icon size={28} className="text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                      <p className="text-foreground/60 mb-4">{feature.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {feature.highlights.map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm">
                            <Check size={14} className="text-secondary shrink-0" />
                            <span className="text-foreground/70">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Templates */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="primary" variant="flat" className="mb-4">Role Management</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Pre-Built Role Templates
            </h2>
            <p className="text-foreground/60">
              Start with our templates and customize as needed.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {roleTemplates.map((role) => (
              <Card key={role.role} className="modern-card w-[200px]">
                <CardBody className="p-4 text-center">
                  <Chip color={role.color as any} size="sm" className="mb-2">{role.role}</Chip>
                  <p className="text-xs text-foreground/50">{role.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Permissions Matrix Preview */}
          <Card className="modern-card overflow-hidden max-w-4xl mx-auto">
            <CardBody className="p-0">
              <div className="p-6 border-b border-foreground/5">
                <h3 className="font-black">Granular Permission Control</h3>
                <p className="text-sm text-foreground/50">Control access at the feature level</p>
              </div>
              <div className="divide-y divide-foreground/5">
                {permissionModules.slice(0, 3).map((module) => (
                  <div key={module.module} className="p-4 flex flex-wrap items-center gap-4">
                    <div className="w-24 font-bold">{module.module}</div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {module.permissions.map((perm) => (
                        <Chip key={perm} size="sm" variant="flat">{perm}</Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-foreground/[0.02] text-center">
                <p className="text-sm text-foreground/50">+ 20 more permission categories</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Leave Management */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="warning" variant="flat" className="mb-4">Leave Management</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Track Leaves Effortlessly
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leaveTypes.map((leave) => (
              <Card key={leave.type} className="modern-card">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar size={20} className="text-warning" />
                    <h3 className="font-black">{leave.type}</h3>
                  </div>
                  <p className="text-2xl font-black text-warning mb-2">{leave.days}</p>
                  <p className="text-sm text-foreground/50">{leave.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Example */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="success" variant="flat" className="mb-4">Performance</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Track & Reward Top Performers
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="modern-card">
              <CardBody className="p-8">
                <h3 className="font-black mb-6">This Month's Leaderboard</h3>
                <div className="space-y-6">
                  {[
                    { name: 'Rahul S.', role: 'Cashier', sales: 245000, target: 200000, emoji: '🥇' },
                    { name: 'Priya M.', role: 'Cashier', sales: 218000, target: 200000, emoji: '🥈' },
                    { name: 'Amit K.', role: 'Sales', sales: 195000, target: 200000, emoji: '🥉' },
                  ].map((staff, idx) => (
                    <div key={staff.name} className="flex items-center gap-4">
                      <div className="text-2xl">{staff.emoji}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <div>
                            <span className="font-bold">{staff.name}</span>
                            <span className="text-sm text-foreground/50 ml-2">{staff.role}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-success">₹{(staff.sales / 1000).toFixed(0)}K</span>
                            <span className="text-sm text-foreground/50 ml-1">/ ₹{(staff.target / 1000).toFixed(0)}K</span>
                          </div>
                        </div>
                        <Progress 
                          value={Math.min((staff.sales / staff.target) * 100, 100)} 
                          color={staff.sales >= staff.target ? 'success' : 'warning'}
                          size="sm"
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="primary" variant="flat" className="mb-4">Pricing</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Staff Features by Plan
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse max-w-4xl mx-auto">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left py-4 px-4 font-bold">Feature</th>
                  <th className="text-center py-4 px-4 font-bold">Starter</th>
                  <th className="text-center py-4 px-4 font-bold bg-secondary/5">Business</th>
                  <th className="text-center py-4 px-4 font-bold">Professional</th>
                </tr>
              </thead>
              <tbody>
                {pricingComparison.map((row) => (
                  <tr key={row.feature} className="border-b border-foreground/5">
                    <td className="py-4 px-4 text-foreground/70">{row.feature}</td>
                    <td className="py-4 px-4 text-center">{row.starter}</td>
                    <td className="py-4 px-4 text-center bg-secondary/5">{row.business}</td>
                    <td className="py-4 px-4 text-center">{row.professional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="default" variant="flat" className="mb-4">FAQs</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.question} className="modern-card">
                <CardBody className="p-6">
                  <h3 className="font-black mb-3">{faq.question}</h3>
                  <p className="text-foreground/60">{faq.answer}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-custom">
          <Card className="modern-card bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardBody className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Manage Your Team Better
              </h2>
              <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
                From attendance to payroll, simplify HR for your retail business.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button as={Link} href="/register" color="secondary" size="lg" className="font-black" radius="full">
                  Start Free 14-Day Trial
                  <ArrowRight size={18} />
                </Button>
                <Button as={Link} href="/contact" variant="bordered" size="lg" className="font-bold" radius="full">
                  Talk to Sales
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </main>
  );
}
