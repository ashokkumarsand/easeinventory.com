'use client';

import { Button, Card, CardBody, Chip } from '@heroui/react';
import { ArrowRight, Camera, Check, CheckCircle, Clock, FileText, MessageCircle, Phone, Settings, Smartphone, TrendingUp, User, Users, Wrench, Zap } from 'lucide-react';
import Link from 'next/link';

const repairWorkflow = [
  {
    step: '01',
    title: 'Device Intake',
    description: 'Customer arrives with faulty device. Create ticket in 30 seconds with device details, problem description, and photos of current condition.',
    icon: Smartphone,
  },
  {
    step: '02',
    title: 'Diagnosis & Quotation',
    description: 'Technician diagnoses the issue, adds spare part requirements. System generates quotation. WhatsApp sent to customer for approval.',
    icon: Wrench,
  },
  {
    step: '03',
    title: 'Repair & Quality Check',
    description: 'Work begins after approval. Track time spent, parts used. Upload after-repair photos. Quality check before delivery.',
    icon: Settings,
  },
  {
    step: '04',
    title: 'Delivery & Payment',
    description: 'Customer notified via WhatsApp. Generate invoice with warranty. Record payment. Ticket closed with complete history.',
    icon: CheckCircle,
  },
];

const coreFeatures = [
  {
    icon: FileText,
    title: 'Smart Ticket Management',
    description: 'Create detailed repair tickets with device info, IMEI/serial numbers, fault description, and condition photos. Track status from intake to delivery.',
    highlights: ['Auto-generated ticket numbers', 'Priority levels (Normal/Urgent/VIP)', 'Multiple devices per customer', 'Linked to inventory for parts'],
  },
  {
    icon: Users,
    title: 'Technician Assignment & Tracking',
    description: 'Assign repairs to technicians based on skill and workload. Track time spent per repair. Performance dashboards for each technician.',
    highlights: ['Skill-based assignment', 'Time tracking per job', 'Daily workload view', 'Performance benchmarks'],
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Notifications',
    description: 'Automatic WhatsApp messages to customers at every stage. Quotation approval, repair updates, ready-for-pickup alerts—all automated.',
    highlights: ['Status change alerts', 'Quotation sharing', 'Payment reminders', 'Pickup notifications'],
  },
  {
    icon: Camera,
    title: 'Photo Documentation',
    description: 'Attach before and after photos to every repair. Protect against false damage claims. Build a visual history of each device.',
    highlights: ['Before/after comparison', 'Damage documentation', 'Cloud storage', 'Easy retrieval'],
  },
];

const additionalFeatures = [
  { icon: Clock, title: 'TAT Tracking', description: 'Monitor turnaround time with SLA alerts' },
  { icon: Wrench, title: 'Spare Parts Integration', description: 'Link repairs to inventory for parts tracking' },
  { icon: TrendingUp, title: 'Repair Analytics', description: 'Common issues, success rates, revenue reports' },
  { icon: User, title: 'Customer History', description: 'Complete repair history per customer/device' },
  { icon: Phone, title: 'Warranty Tracking', description: 'Internal and manufacturer warranty management' },
  { icon: Zap, title: 'Quick Actions', description: 'One-click status updates and notifications' },
];

const testimonials = [
  {
    quote: "We used to lose track of repairs all the time. Now every phone is accounted for with photos and status updates. Customers love the WhatsApp updates!",
    author: "Rajesh Kumar",
    role: "Mobile Galaxy, Chennai",
    rating: 5,
  },
  {
    quote: "The technician performance tracking helped us identify our best staff. Service time dropped by 30% after we optimized assignments.",
    author: "Priya Sharma",
    role: "TechCare Solutions, Mumbai",
    rating: 5,
  },
];

const faqs = [
  {
    question: 'Can I track repairs for multiple device types?',
    answer: 'Yes! EaseInventory handles mobiles, laptops, TVs, ACs, appliances, and any other device type. You can customize fields per device category.',
  },
  {
    question: 'How do WhatsApp notifications work?',
    answer: 'We integrate with WhatsApp Business API (official Meta API). Messages are sent automatically when ticket status changes. Customers can respond directly. No third-party tools needed.',
  },
  {
    question: 'Can technicians access the system on their phones?',
    answer: 'Absolutely. EaseInventory is fully mobile-responsive. Technicians can update status, add notes, upload photos, and view their assigned jobs from any device.',
  },
  {
    question: 'How is repair revenue calculated?',
    answer: 'Each repair ticket includes labor charges, spare parts (linked to inventory cost), and any additional fees. The system calculates profit per repair, per technician, and overall.',
  },
];

const pricingComparison = [
  { feature: 'Repair Tickets/Month', starter: '100', business: '500', professional: 'Unlimited' },
  { feature: 'Technicians', starter: '2', business: '5', professional: '15+' },
  { feature: 'WhatsApp Notifications', starter: '50/mo', business: '200/mo', professional: 'Unlimited' },
  { feature: 'Photo Attachments', starter: '✓', business: '✓', professional: '✓' },
  { feature: 'Technician Performance', starter: '—', business: '✓', professional: '✓' },
  { feature: 'Custom Workflow', starter: '—', business: '—', professional: '✓' },
];

export default function RepairLogisticsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[200px]" />
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-6">
                <Wrench size={14} className="text-secondary" />
                <span className="text-xs font-black uppercase tracking-widest text-secondary">Service Management</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                Repair Chaos?<br />
                <span className="text-secondary">Consider It Fixed.</span>
              </h1>
              
              <p className="text-lg text-foreground/60 leading-relaxed mb-8 max-w-xl">
                Track every repair from intake to delivery. Assign technicians, document with photos, 
                auto-notify customers via WhatsApp, and analyze your service performance—all in one place.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button as={Link} href="/register" color="secondary" size="lg" className="font-black" radius="full">
                  Start 14-Day Free Trial
                  <ArrowRight size={18} />
                </Button>
                <Button as={Link} href="#workflow" variant="bordered" size="lg" className="font-bold" radius="full">
                  See How It Works
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-foreground/60">Mobile & electronics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-foreground/60">WhatsApp built-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-secondary" />
                  <span className="text-foreground/60">Photo documentation</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="modern-card p-6">
                <div className="text-4xl font-black text-secondary mb-2">40%</div>
                <div className="text-sm font-bold text-foreground/50">Faster Turnaround</div>
                <p className="text-xs text-foreground/40 mt-2">Average improvement after 2 months</p>
              </Card>
              <Card className="modern-card p-6">
                <div className="text-4xl font-black text-secondary mb-2">0</div>
                <div className="text-sm font-bold text-foreground/50">Lost Devices</div>
                <p className="text-xs text-foreground/40 mt-2">With complete ticket tracking</p>
              </Card>
              <Card className="modern-card p-6">
                <div className="text-4xl font-black text-secondary mb-2">95%</div>
                <div className="text-sm font-bold text-foreground/50">Customer Satisfaction</div>
                <p className="text-xs text-foreground/40 mt-2">With automated WhatsApp updates</p>
              </Card>
              <Card className="modern-card p-6">
                <div className="text-4xl font-black text-secondary mb-2">2x</div>
                <div className="text-sm font-bold text-foreground/50">Team Efficiency</div>
                <p className="text-xs text-foreground/40 mt-2">With smart assignment & tracking</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Repair Workflow */}
      <section id="workflow" className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="secondary" variant="flat" className="mb-4">Repair Workflow</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              From Faulty Device to Happy Customer
            </h2>
            <p className="text-foreground/60">
              A streamlined workflow that covers every step of the repair process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {repairWorkflow.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 relative">
                    <item.icon size={28} className="text-secondary" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-white text-sm font-black flex items-center justify-center">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-black mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/60">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-secondary/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="primary" variant="flat" className="mb-4">Core Features</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Everything for Professional Service Centers
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

      {/* Additional Features */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="warning" variant="flat" className="mb-4">More Features</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              And That's Not All
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title} className="modern-card">
                <CardBody className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                    <feature.icon size={24} className="text-warning" />
                  </div>
                  <h3 className="font-black mb-2">{feature.title}</h3>
                  <p className="text-sm text-foreground/60">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="success" variant="flat" className="mb-4">Testimonials</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              What Service Centers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="modern-card">
                <CardBody className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-500">★</span>
                    ))}
                  </div>
                  <p className="text-foreground/70 italic mb-6">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-black">{testimonial.author}</p>
                    <p className="text-sm text-foreground/50">{testimonial.role}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="primary" variant="flat" className="mb-4">Pricing</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Repair Features by Plan
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
      <section className="py-20">
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
                Ready to Streamline Your Repairs?
              </h2>
              <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
                Join service centers across India who've reduced turnaround time and increased customer satisfaction.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button as={Link} href="/register" color="secondary" size="lg" className="font-black" radius="full">
                  Start Free 14-Day Trial
                  <ArrowRight size={18} />
                </Button>
                <Button as={Link} href="/contact" variant="bordered" size="lg" className="font-bold" radius="full">
                  Request Demo
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </main>
  );
}
