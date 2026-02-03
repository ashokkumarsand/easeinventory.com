'use client';

import { Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const sections = [
  {
    title: 'Information We Collect',
    content: [
      'Account information (name, email, phone number, business details)',
      'Inventory and sales data you enter into the platform',
      'Usage data (how you interact with our features)',
      'Device information (browser type, IP address, device identifiers)',
      'Payment information (processed securely via Razorpay)',
    ],
  },
  {
    title: 'How We Use Your Information',
    content: [
      'Provide and improve our inventory management services',
      'Process transactions and send service notifications',
      'Send WhatsApp/SMS alerts you\'ve opted into',
      'Analyze usage patterns to improve our product',
      'Comply with legal obligations and prevent fraud',
    ],
  },
  {
    title: 'Data Storage & Security',
    content: [
      'All data stored on AWS servers in Mumbai (ap-south-1)',
      'End-to-end encryption for sensitive data',
      'Regular security audits and penetration testing',
      'SOC 2 Type II compliance in progress',
      'Row-level security ensures tenant data isolation',
    ],
  },
  {
    title: 'Your Rights',
    content: [
      'Access your data anytime through your dashboard',
      'Export all your data in standard formats (CSV, Excel)',
      'Request deletion of your account and all associated data',
      'Opt-out of marketing communications anytime',
      'Lodge complaints with relevant data protection authorities',
    ],
  },
  {
    title: 'Data Sharing',
    content: [
      'We never sell your data to third parties',
      'Data shared only with essential service providers (AWS, Razorpay)',
      'All service providers bound by strict data protection agreements',
      'Government requests complied with only when legally required',
      'You control what data is visible to your staff members',
    ],
  },
  {
    title: 'Cookies & Tracking',
    content: [
      'Essential cookies for authentication and security',
      'Analytics cookies to understand usage (can be disabled)',
      'No third-party advertising cookies',
      'Local storage for offline functionality',
      'You can manage cookie preferences in settings',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">🔒</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Legal</span>
              </div>

              <h1 className="heading-lg mb-8">
                Privacy <span className="text-primary italic">Protocol</span>
              </h1>

              <p className="paragraph-lg mb-6 max-w-2xl mx-auto">
                Your trust is our foundation. We're committed to protecting your data
                and being transparent about how we use it.
              </p>

              <p className="text-sm text-foreground/40">
                Last updated: February 2026
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding relative">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card">
                    <CardBody className="p-8 lg:p-10">
                      <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">{section.title}</h2>
                      <ul className="space-y-4">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                            <span className="text-foreground/70 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="modern-card bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                  <CardBody className="p-8 lg:p-10">
                    <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">Questions?</h2>
                    <p className="text-foreground/70 mb-4 italic">
                      For privacy-related inquiries, contact our Data Protection Officer:
                    </p>
                    <a href="mailto:privacy@easeinventory.com" className="text-primary font-bold hover:underline">
                      privacy@easeinventory.com
                    </a>
                  </CardBody>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
