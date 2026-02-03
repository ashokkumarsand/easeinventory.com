'use client';

import { Button, Card, CardBody, Chip } from '@heroui/react';
import { ArrowRight, Bell, Check, Clock, Mail, MessageCircle, Package, TrendingDown } from 'lucide-react';
import Link from 'next/link';

const alertTypes = [
  {
    icon: Package,
    title: 'Low Stock Alerts',
    description: 'Get notified when any product falls below minimum stock level. Configure thresholds per product or category.',
    channels: ['WhatsApp', 'Email', 'Push'],
    example: '⚠️ Low Stock Alert: iPhone 15 Case (Black) is at 3 units. Min level: 10. Reorder now!',
  },
  {
    icon: TrendingDown,
    title: 'Expiry Alerts',
    description: 'Notifications 30, 15, and 7 days before product expiry. FIFO reminders to sell older stock first.',
    channels: ['Email', 'Dashboard'],
    example: '🔔 Expiry Alert: Batch #1234 of Paracetamol expires in 15 days. 200 units remaining.',
  },
  {
    icon: MessageCircle,
    title: 'Repair Status Updates',
    description: 'Automatic WhatsApp messages to customers when repair status changes. Quotation approval requests.',
    channels: ['WhatsApp'],
    example: '✅ Repair Update: Your iPhone repair is complete! Ready for pickup at Mobile Galaxy, Chennai.',
  },
  {
    icon: Clock,
    title: 'Payment Reminders',
    description: 'Supplier payment due reminders. Customer credit payment follow-ups. Recurring invoice alerts.',
    channels: ['WhatsApp', 'Email'],
    example: '💰 Payment Due: ₹25,000 due to ABC Distributors in 3 days. Clear to maintain credit.',
  },
];

const channelDetails = [
  {
    icon: MessageCircle,
    channel: 'WhatsApp Business',
    description: 'Official Meta WhatsApp Business API integration. Messages appear from your business name.',
    features: ['Rich text formatting', 'Media attachments', 'Quick reply buttons', 'Read receipts'],
    cost: 'Free tier: 200 messages/month. Business: Unlimited.',
  },
  {
    icon: Mail,
    channel: 'Email',
    description: 'Transactional emails for detailed reports, daily summaries, and formal notifications.',
    features: ['HTML-formatted', 'Attachments support', 'Bulk sending', 'Custom templates'],
    cost: 'Unlimited with all plans.',
  },
  {
    icon: Bell,
    channel: 'Push Notifications',
    description: 'Real-time alerts on mobile and desktop. Requires EaseInventory app installation.',
    features: ['Instant delivery', 'Rich notifications', 'Action buttons', 'Silent mode'],
    cost: 'Unlimited with all plans.',
  },
];

const automationRules = [
  {
    trigger: 'Stock falls below minimum',
    action: 'Send WhatsApp to owner + create purchase order draft',
    configurable: ['Minimum level', 'Recipients', 'Auto-create PO'],
  },
  {
    trigger: 'Repair status changes',
    action: 'Send WhatsApp to customer with update',
    configurable: ['Which statuses trigger', 'Message template', 'Include invoice'],
  },
  {
    trigger: 'Daily at 9 AM',
    action: 'Send business summary email',
    configurable: ['Time', 'Recipients', 'Metrics to include'],
  },
  {
    trigger: 'Payment due in 3 days',
    action: 'Send reminder to supplier/customer',
    configurable: ['Days before due', 'Frequency', 'Escalation'],
  },
];

const notificationStats = [
  { label: 'Messages Sent Monthly', value: '500K+', desc: 'Across all EaseInventory users' },
  { label: 'Delivery Rate', value: '99.5%', desc: 'WhatsApp and Email combined' },
  { label: 'Avg Response Time', value: '<30s', desc: 'From trigger to delivery' },
  { label: 'Customer Satisfaction', value: '4.8/5', desc: 'For repair notifications' },
];

const faqs = [
  {
    question: 'Is WhatsApp integration official?',
    answer: "Yes, we use the official WhatsApp Business API by Meta. Messages come from your verified business name. It's not a third-party tool—it's direct integration with Facebook/Meta infrastructure.",
  },
  {
    question: 'Can I customize notification templates?',
    answer: 'Absolutely. You can customize the message text, add your store name, include specific product details, and even add promotional content. Templates can be in English or Hindi.',
  },
  {
    question: 'Will customers see my business name?',
    answer: "Yes, when you send WhatsApp messages, customers see your verified business name and logo. You can also display your business description and working hours.",
  },
  {
    question: 'How many notifications can I send?',
    answer: 'Starter plan: 50 WhatsApp messages/month. Business: 200/month. Professional: Unlimited. Email and push notifications are unlimited on all plans.',
  },
  {
    question: 'Can I send notifications in Hindi?',
    answer: 'Yes! You can create templates in English, Hindi, or any regional language. EaseInventory supports Unicode, so all Indian languages work.',
  },
];

export default function SmartAlertsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-warning/5 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-warning/10 rounded-full blur-[200px]" />
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-warning/10 border border-warning/20 px-4 py-2 rounded-full mb-6">
                <Bell size={14} className="text-warning" />
                <span className="text-xs font-black uppercase tracking-widest text-warning">Automation</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                Never Miss<br />
                <span className="text-warning">What Matters.</span>
              </h1>
              
              <p className="text-lg text-foreground/60 leading-relaxed mb-8 max-w-xl">
                Automated WhatsApp, Email, and push notifications for low stock, repairs, payments, 
                and more. Get the right alert to the right person at the right time.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button as={Link} href="/register" color="warning" size="lg" className="font-black" radius="full">
                  Start 14-Day Free Trial
                  <ArrowRight size={18} />
                </Button>
                <Button as={Link} href="#alerts" variant="bordered" size="lg" className="font-bold" radius="full">
                  See Alert Types
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-warning" />
                  <span className="text-foreground/60">Official WhatsApp API</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-warning" />
                  <span className="text-foreground/60">Multi-channel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-warning" />
                  <span className="text-foreground/60">Customizable rules</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {notificationStats.map((stat) => (
                <Card key={stat.label} className="modern-card p-6">
                  <div className="text-3xl font-black text-warning mb-1">{stat.value}</div>
                  <div className="text-sm font-bold text-foreground/50">{stat.label}</div>
                  <p className="text-xs text-foreground/40 mt-2">{stat.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alert Types */}
      <section id="alerts" className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="warning" variant="flat" className="mb-4">Alert Types</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Alerts for Every Business Event
            </h2>
          </div>

          <div className="space-y-6">
            {alertTypes.map((alert) => (
              <Card key={alert.title} className="modern-card overflow-hidden">
                <CardBody className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                          <alert.icon size={24} className="text-warning" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black mb-1">{alert.title}</h3>
                          <div className="flex gap-2">
                            {alert.channels.map((ch) => (
                              <Chip key={ch} size="sm" variant="flat" color="default">{ch}</Chip>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-foreground/60">{alert.description}</p>
                    </div>
                    <div className="bg-foreground/[0.02] rounded-xl p-4 border border-foreground/5">
                      <p className="text-xs font-bold text-foreground/40 mb-2 uppercase">Example Message</p>
                      <p className="text-sm text-foreground/70 font-mono">{alert.example}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="primary" variant="flat" className="mb-4">Channels</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Reach People Where They Are
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {channelDetails.map((channel) => (
              <Card key={channel.channel} className="modern-card h-full">
                <CardBody className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <channel.icon size={28} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-black mb-2">{channel.channel}</h3>
                  <p className="text-foreground/60 mb-4">{channel.description}</p>
                  <div className="space-y-2 mb-4">
                    {channel.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check size={14} className="text-primary shrink-0" />
                        <span className="text-foreground/70">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-foreground/40 border-t border-foreground/5 pt-4 mt-auto">
                    {channel.cost}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Automation Rules */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Chip color="secondary" variant="flat" className="mb-4">Automation</Chip>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Set It and Forget It
            </h2>
            <p className="text-foreground/60">
              Configure rules once. EaseInventory handles the rest automatically.
            </p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {automationRules.map((rule) => (
              <Card key={rule.trigger} className="modern-card">
                <CardBody className="p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs font-bold text-foreground/40 mb-1">WHEN</p>
                      <p className="font-bold">{rule.trigger}</p>
                    </div>
                    <div className="text-2xl text-foreground/20">→</div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs font-bold text-foreground/40 mb-1">THEN</p>
                      <p className="font-bold text-primary">{rule.action}</p>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs font-bold text-foreground/40 mb-1">CONFIGURE</p>
                      <div className="flex flex-wrap gap-1">
                        {rule.configurable.map((config) => (
                          <Chip key={config} size="sm" variant="flat">{config}</Chip>
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
          <Card className="modern-card bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardBody className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Stay Informed, Stay Ahead
              </h2>
              <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
                Set up smart alerts in minutes and never worry about missing important business events.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button as={Link} href="/register" color="warning" size="lg" className="font-black" radius="full">
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
