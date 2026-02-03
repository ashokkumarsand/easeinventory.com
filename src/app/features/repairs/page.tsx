'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { value: '40%', label: 'Faster Turnaround', icon: '⚡' },
  { value: '0', label: 'Lost Devices', icon: '🔒' },
  { value: '95%', label: 'Customer Satisfaction', icon: '⭐' },
  { value: '2x', label: 'Team Efficiency', icon: '🚀' },
];

const coreFeatures = [
  {
    icon: '📋',
    title: 'Smart Ticket Management',
    tag: 'Organize',
    description: 'Create detailed repair tickets with device info, IMEI/serial numbers, fault description, and condition photos.',
    highlights: ['Auto ticket numbers', 'Priority levels', 'Multiple devices', 'Linked to inventory'],
  },
  {
    icon: '👨‍🔧',
    title: 'Technician Assignment',
    tag: 'Assign',
    description: 'Assign repairs to technicians based on skill and workload. Track time spent per repair.',
    highlights: ['Skill-based assignment', 'Time tracking', 'Daily workload view', 'Performance metrics'],
  },
  {
    icon: '💬',
    title: 'WhatsApp Notifications',
    tag: 'Communicate',
    description: 'Automatic WhatsApp messages to customers at every stage. Quotation approval and pickup alerts.',
    highlights: ['Status change alerts', 'Quotation sharing', 'Payment reminders', 'Pickup notifications'],
  },
  {
    icon: '📸',
    title: 'Photo Documentation',
    tag: 'Protect',
    description: 'Attach before and after photos to every repair. Protect against false damage claims.',
    highlights: ['Before/after photos', 'Damage documentation', 'Cloud storage', 'Easy retrieval'],
  },
];

const howItWorks = [
  { step: '01', title: 'Device Intake', description: 'Create ticket in 30 seconds with device details, problem description, and condition photos.', icon: '📱' },
  { step: '02', title: 'Diagnosis & Quote', description: 'Technician diagnoses, adds parts needed. WhatsApp quotation sent to customer.', icon: '🔍' },
  { step: '03', title: 'Repair & Deliver', description: 'Repair after approval, quality check, notify customer. Generate invoice with warranty.', icon: '✅' },
];

const additionalFeatures = [
  { icon: '⏱️', title: 'TAT Tracking', description: 'Monitor turnaround time with SLA alerts and escalations.' },
  { icon: '🔧', title: 'Parts Integration', description: 'Link repairs to inventory for spare parts tracking.' },
  { icon: '📊', title: 'Repair Analytics', description: 'Common issues, success rates, revenue reports.' },
  { icon: '📱', title: 'Warranty Tracking', description: 'Internal and manufacturer warranty management.' },
  { icon: '⚙️', title: 'Custom Workflow', description: 'Configure repair statuses to match your process.' },
  { icon: '⚡', title: 'Quick Actions', description: 'One-click status updates and customer notifications.' },
];

const faqs = [
  { q: 'Can I track repairs for multiple device types?', a: 'Yes! Handles mobiles, laptops, TVs, ACs, appliances, and any other device type. Customize fields per category.' },
  { q: 'How do WhatsApp notifications work?', a: 'Official WhatsApp Business API integration. Messages sent automatically when ticket status changes. Customers can respond directly.' },
  { q: 'Can technicians access on their phones?', a: 'Absolutely. Fully mobile-responsive. Update status, add notes, upload photos from any device.' },
  { q: 'How is repair revenue calculated?', a: 'Each ticket includes labor charges, spare parts (linked to inventory cost), and additional fees. Profit calculated automatically.' },
];

export default function RepairsPage() {
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
                <span className="text-xl">🔧</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Repair Management</span>
              </div>

              <h1 className="heading-lg mb-8">
                Repair Chaos?<br />
                <span className="text-primary italic">Consider It Fixed.</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-xl">
                Track every repair from intake to delivery. Assign technicians, document with photos,
                auto-notify customers via WhatsApp, and analyze service performance.
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
                {['Mobile & electronics', 'WhatsApp built-in', 'Photo documentation'].map((item) => (
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
              Everything for Professional <span className="text-primary italic">Service Centers</span>
            </h2>
            <p className="paragraph-lg">
              Streamline your repair workflow from device intake to customer delivery.
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
              From Faulty Device to <span className="text-secondary italic">Happy Customer</span>
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
              And That's <span className="text-warning italic">Not All</span>
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
                  <div className="text-6xl mb-8">🔧</div>
                  <h2 className="heading-lg mb-6">
                    Ready to Streamline Your <span className="text-primary italic">Repairs?</span>
                  </h2>
                  <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                    Join service centers across India who have reduced turnaround time and increased satisfaction.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button as={Link} href="/register" color="primary" size="lg" className="font-black px-12 h-16 shadow-xl shadow-primary/30 uppercase tracking-widest" radius="full">
                      Start Free Trial
                      <ArrowRight size={20} />
                    </Button>
                    <Button as={Link} href="/#contact" variant="bordered" size="lg" className="font-black px-12 h-16 uppercase tracking-widest border-foreground/10" radius="full">
                      Request Demo
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
