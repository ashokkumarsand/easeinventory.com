'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { value: '500K+', label: 'Messages Sent', icon: '📨' },
  { value: '99.5%', label: 'Delivery Rate', icon: '✅' },
  { value: '<30s', label: 'Response Time', icon: '⚡' },
  { value: '4.8/5', label: 'Satisfaction', icon: '⭐' },
];

const coreFeatures = [
  {
    icon: '📦',
    title: 'Low Stock Alerts',
    tag: 'Inventory',
    description: 'Get notified when any product falls below minimum stock level. Configure thresholds per product.',
    highlights: ['Per-product thresholds', 'WhatsApp/Email/Push', 'Auto reorder drafts', 'Batch notifications'],
  },
  {
    icon: '📅',
    title: 'Expiry Alerts',
    tag: 'Compliance',
    description: 'Notifications 30, 15, and 7 days before product expiry. FIFO reminders for older stock.',
    highlights: ['Multi-day reminders', 'FIFO/FEFO alerts', 'Batch tracking', 'Dashboard warnings'],
  },
  {
    icon: '🔧',
    title: 'Repair Status Updates',
    tag: 'Service',
    description: 'Automatic WhatsApp messages to customers when repair status changes. Quotation approvals.',
    highlights: ['Status change alerts', 'Quotation sharing', 'Ready for pickup', 'Customer replies'],
  },
  {
    icon: '💰',
    title: 'Payment Reminders',
    tag: 'Finance',
    description: 'Supplier payment due reminders. Customer credit follow-ups. Recurring invoice alerts.',
    highlights: ['Due date alerts', 'Credit reminders', 'Supplier payments', 'Escalation rules'],
  },
];

const howItWorks = [
  { step: '01', title: 'Set Triggers', description: 'Define what events should trigger notifications—low stock, status changes, due dates.', icon: '⚙️' },
  { step: '02', title: 'Choose Channels', description: 'Select WhatsApp, Email, or Push notifications. Customize message templates.', icon: '📱' },
  { step: '03', title: 'Automate', description: 'Notifications sent automatically. Track delivery status and responses in dashboard.', icon: '🚀' },
];

const additionalFeatures = [
  { icon: '💬', title: 'WhatsApp Business API', description: 'Official Meta integration with verified business name.' },
  { icon: '📧', title: 'Email Notifications', description: 'HTML-formatted emails with attachments and bulk sending.' },
  { icon: '🔔', title: 'Push Notifications', description: 'Real-time alerts on mobile and desktop devices.' },
  { icon: '📝', title: 'Custom Templates', description: 'Create templates in English, Hindi, or regional languages.' },
  { icon: '⚡', title: 'Instant Delivery', description: 'Messages delivered within seconds of trigger event.' },
  { icon: '📊', title: 'Scheduled Reports', description: 'Daily business summary emails at your preferred time.' },
];

const faqs = [
  { q: 'Is WhatsApp integration official?', a: 'Yes, we use the official WhatsApp Business API by Meta. Messages come from your verified business name.' },
  { q: 'Can I customize notification templates?', a: 'Absolutely. Customize message text, add your store name, include product details, and even promotional content.' },
  { q: 'How many notifications can I send?', a: 'Starter: 50 WhatsApp/month. Business: 200/month. Professional: Unlimited. Email and push are unlimited on all plans.' },
  { q: 'Can I send notifications in Hindi?', a: 'Yes! Create templates in English, Hindi, or any regional language. Full Unicode support.' },
];

export default function AlertsPage() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] pt-32 pb-20 lg:pt-40 lg:pb-32 flex items-center">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-warning/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 bg-warning/10 border border-warning/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">🔔</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning">Smart Alerts</span>
              </div>

              <h1 className="heading-lg mb-8">
                Never Miss<br />
                <span className="text-warning italic">What Matters.</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-xl">
                Automated WhatsApp, Email, and push notifications for low stock, repairs, payments,
                and more. Get the right alert to the right person at the right time.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button asChild className="font-black px-10 h-16 shadow-xl shadow-warning/30 uppercase tracking-widest rounded-full bg-warning text-warning-foreground hover:bg-warning/90">
                  <Link href="/register">
                    Start Free Trial
                    <ArrowRight size={20} />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="font-black px-10 h-16 uppercase tracking-widest border-foreground/10 rounded-full">
                  <Link href="#features">
                    Explore
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-8">
                {['Official WhatsApp', 'Multi-channel', 'Custom rules'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center">
                      <Check size={12} className="text-warning" />
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
                  <CardContent className="p-8">
                    <div className="text-4xl mb-4">{stat.icon}</div>
                    <div className="text-4xl font-black text-warning mb-2">{stat.value}</div>
                    <div className="text-sm font-bold text-foreground/50">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="section-padding relative">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-warning/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-warning/10 border border-warning/20 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-warning animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning">Core Features</span>
            </div>
            <h2 className="heading-lg mb-6">
              Alerts for Every <span className="text-warning italic">Business</span> Event
            </h2>
            <p className="paragraph-lg">
              Stay informed about what matters most to your business operations.
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
                <Card className="modern-card h-full group hover:border-warning/30 transition-all duration-500">
                  <CardContent className="p-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-20 h-20 rounded-[28px] bg-warning/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                        {feature.icon}
                      </div>
                      <div className="bg-foreground/[0.03] dark:bg-white/5 px-4 py-1.5 rounded-full">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{feature.tag}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black mb-4 group-hover:text-warning transition-colors uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-foreground/60 leading-relaxed mb-6 italic">{feature.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.highlights.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                          <span className="text-sm text-foreground/70">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
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
              Set It and <span className="text-secondary italic">Forget It</span>
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
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Channels</span>
            </div>
            <h2 className="heading-lg mb-6">
              Reach People <span className="text-primary italic">Where</span> They Are
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
                <Card className="modern-card h-full group hover:border-primary/30 transition-all duration-500">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-black mb-3 uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-foreground/60 italic">{feature.description}</p>
                  </CardContent>
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
              Questions? <span className="text-warning italic">Answered.</span>
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
                  <CardContent className="p-8">
                    <h3 className="text-lg font-black mb-3">{faq.q}</h3>
                    <p className="text-foreground/60 italic leading-relaxed">{faq.a}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-warning/5 to-transparent pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="modern-card bg-gradient-to-br from-warning/10 via-warning/5 to-transparent border-warning/20 overflow-hidden">
              <CardContent className="p-12 lg:p-20 text-center relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-warning/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-6xl mb-8">🔔</div>
                  <h2 className="heading-lg mb-6">
                    Stay <span className="text-warning italic">Informed</span>, Stay Ahead
                  </h2>
                  <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                    Set up smart alerts in minutes and never worry about missing important business events.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild className="font-black px-12 h-16 shadow-xl shadow-warning/30 uppercase tracking-widest rounded-full bg-warning text-warning-foreground hover:bg-warning/90">
                      <Link href="/register">
                        Start Free Trial
                        <ArrowRight size={20} />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="font-black px-12 h-16 uppercase tracking-widest border-foreground/10 rounded-full">
                      <Link href="/#contact">
                        Talk to Sales
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
