'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { value: '80%', label: 'Payroll Time Saved', icon: '⚡' },
  { value: '100%', label: 'Attendance Accuracy', icon: '🎯' },
  { value: '15min', label: 'Monthly Payroll', icon: '⏱️' },
  { value: '0', label: 'Payroll Errors', icon: '✅' },
];

const coreFeatures = [
  {
    icon: '⏰',
    title: 'Attendance Tracking',
    tag: 'Daily',
    description: 'Digital check-in/check-out via app or dashboard. Optional geo-tagging to verify location.',
    highlights: ['Mobile check-in', 'Geo-location', 'Late arrival reports', 'Shift management'],
  },
  {
    icon: '💰',
    title: 'Payroll Calculation',
    tag: 'Automated',
    description: 'Automatic salary calculation based on attendance, leaves, and incentives. Monthly payslip generation.',
    highlights: ['Auto calculation', 'Leave deductions', 'Incentive tracking', 'Payslip generation'],
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    tag: 'Security',
    description: 'Control who sees what. Create roles like Cashier, Store Manager with specific permissions.',
    highlights: ['Custom roles', 'Granular permissions', 'Feature-level control', 'Audit logging'],
  },
  {
    icon: '📊',
    title: 'Performance Tracking',
    tag: 'Insights',
    description: 'Track sales per employee, repairs completed, and targets achieved. Leaderboards and incentives.',
    highlights: ['Sales per employee', 'Target tracking', 'Leaderboards', 'Incentive triggers'],
  },
];

const howItWorks = [
  { step: '01', title: 'Add Staff', description: 'Create user accounts with roles, salary structure, and permissions.', icon: '👤' },
  { step: '02', title: 'Track Attendance', description: 'Staff check in via app or dashboard. Late arrivals flagged automatically.', icon: '📲' },
  { step: '03', title: 'Generate Payroll', description: 'One-click payroll calculation with attendance and leave adjustments.', icon: '💵' },
];

const additionalFeatures = [
  { icon: '📅', title: 'Leave Management', description: 'Casual, sick, earned leave tracking with approval workflow.' },
  { icon: '👥', title: 'Pre-built Roles', description: 'Owner, Manager, Cashier, Technician templates ready to use.' },
  { icon: '🛡️', title: 'Granular Permissions', description: 'Control access at feature level—view, create, edit, delete.' },
  { icon: '🎯', title: 'Sales Targets', description: 'Set and track individual sales targets with incentive triggers.' },
  { icon: '💎', title: 'Incentive Structures', description: 'Flat bonus, percentage, or tiered incentives on target achievement.' },
  { icon: '⏱️', title: 'Overtime Tracking', description: 'Automatic overtime calculation based on shift rules.' },
];

const faqs = [
  { q: 'How does attendance tracking work?', a: 'Staff check in via the EaseInventory app (punch button) or dashboard. Optionally enable geo-location to verify they are at the store.' },
  { q: 'Can I set different salary structures?', a: 'Yes. Each staff member can have fixed salary, daily wages, or hourly rates with per-day deductions and incentives.' },
  { q: 'How granular are the permissions?', a: 'Very granular. Control at feature level—a cashier can create invoices but not apply discounts above 10%.' },
  { q: 'Can staff access EaseInventory on phones?', a: 'Yes. Fully mobile-responsive. Staff can check-in, create invoices, update inventory based on permissions.' },
];

export default function StaffPage() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] pt-32 pb-20 lg:pt-40 lg:pb-32 flex items-center">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">👥</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Staff Management</span>
              </div>

              <h1 className="heading-lg mb-8">
                Your Team.<br />
                <span className="text-primary italic">Managed Right.</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-xl">
                Track attendance, calculate payroll, assign roles, and monitor performance—all from
                EaseInventory. Complete HR for retail teams without a separate system.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button as={Link} href="/register" color="primary" size="lg" className="font-black px-10 h-16 shadow-xl shadow-primary/30 uppercase tracking-widest" radius="full">
                  Start Free Trial
                  <ArrowRight size={20} />
                </Button>
                <Button as={Link} href="#features" variant="bordered" size="lg" className="font-black px-10 h-16 uppercase tracking-widest border-foreground/10" radius="full">
                  Explore
                </Button>
              </div>

              <div className="flex flex-wrap gap-8">
                {['Mobile attendance', 'Auto payroll', 'Custom roles'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground/60">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-5"
            >
              {stats.map((stat) => (
                <Card key={stat.label} className="modern-card group hover:scale-105 transition-transform duration-500">
                  <CardBody className="p-8">
                    <div className="text-4xl mb-4">{stat.icon}</div>
                    <div className="text-4xl font-black text-primary mb-2">{stat.value}</div>
                    <div className="text-sm font-bold text-foreground/50">{stat.label}</div>
                  </CardBody>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="section-padding relative">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Core Features</span>
            </div>
            <h2 className="heading-lg mb-6">
              Complete Staff <span className="text-primary italic">Management</span>
            </h2>
            <p className="paragraph-lg">
              Everything you need to manage your retail team efficiently.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="modern-card h-full group hover:border-primary/30 transition-all duration-500">
                  <CardBody className="p-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                        {feature.icon}
                      </div>
                      <div className="bg-foreground/[0.03] dark:bg-white/5 px-4 py-1.5 rounded-full">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{feature.tag}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-foreground/60 leading-relaxed mb-6 italic">{feature.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.highlights.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-sm text-foreground/70">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-foreground/[0.02] relative">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-secondary animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">How It Works</span>
            </div>
            <h2 className="heading-lg mb-6">
              Simple Staff Management in <span className="text-secondary italic">3 Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center text-5xl mx-auto">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-black text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-foreground/60 italic">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="section-padding relative">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-warning/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-warning/10 border border-warning/20 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-warning animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning">Advanced</span>
            </div>
            <h2 className="heading-lg mb-6">
              More HR Features <span className="text-warning italic">Built In</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="modern-card h-full group hover:border-warning/30 transition-all duration-500">
                  <CardBody className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-black mb-3 uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-foreground/60 italic">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-foreground/[0.02] relative">
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-foreground/5 border border-foreground/10 px-4 py-2 rounded-full mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50">FAQs</span>
            </div>
            <h2 className="heading-lg">
              Questions? <span className="text-primary italic">Answered.</span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="modern-card">
                  <CardBody className="p-8">
                    <h3 className="text-lg font-black mb-3">{faq.q}</h3>
                    <p className="text-foreground/60 italic leading-relaxed">{faq.a}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="modern-card bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
              <CardBody className="p-12 lg:p-20 text-center relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-6xl mb-8">👥</div>
                  <h2 className="heading-lg mb-6">
                    Manage Your Team <span className="text-primary italic">Better</span>
                  </h2>
                  <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                    From attendance to payroll, simplify HR for your retail business.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button as={Link} href="/register" color="primary" size="lg" className="font-black px-12 h-16 shadow-xl shadow-primary/30 uppercase tracking-widest" radius="full">
                      Start Free Trial
                      <ArrowRight size={20} />
                    </Button>
                    <Button as={Link} href="/#contact" variant="bordered" size="lg" className="font-black px-12 h-16 uppercase tracking-widest border-foreground/10" radius="full">
                      Talk to Sales
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
