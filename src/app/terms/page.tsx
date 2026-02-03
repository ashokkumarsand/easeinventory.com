'use client';

import { Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const sections = [
  {
    title: 'Acceptance of Terms',
    content: `By accessing or using EaseInventory ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service. These terms apply to all users, including free trial users, paying subscribers, and staff members.`,
  },
  {
    title: 'Account Registration',
    content: `You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must notify us immediately of any unauthorized access. One business may have only one primary account, with multiple staff user accounts underneath.`,
  },
  {
    title: 'Subscription & Payments',
    content: `Paid plans are billed monthly or annually as selected. All payments are processed securely through Razorpay. Prices are in Indian Rupees (INR) and include applicable GST. Subscriptions auto-renew unless cancelled before the renewal date. Refunds are provided as per our Refund Policy—generally within 7 days of payment for unused services.`,
  },
  {
    title: 'Acceptable Use',
    content: `You may use the Service only for lawful business purposes. You may not: use the Service for illegal activities, attempt to gain unauthorized access, interfere with other users' access, upload malicious code, scrape or copy our content without permission, or resell access without authorization. We reserve the right to suspend accounts violating these terms.`,
  },
  {
    title: 'Data Ownership',
    content: `You retain full ownership of all data you input into the Service (inventory, customer info, invoices, etc.). We claim no ownership over your business data. You grant us a limited license to process your data solely to provide the Service. Upon account termination, you may export your data; we retain it for 30 days before permanent deletion.`,
  },
  {
    title: 'Service Availability',
    content: `We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance. We are not liable for downtime caused by factors outside our control (internet outages, third-party services, force majeure). Check our Status page for real-time service health.`,
  },
  {
    title: 'Intellectual Property',
    content: `The Service, including its design, code, logos, and content, is owned by EaseInventory Technologies Private Limited. "Antigravity" and "EaseInventory" are trademarks. You may not copy, modify, distribute, or create derivative works without written permission. Feedback you provide may be used to improve the Service without compensation.`,
  },
  {
    title: 'Limitation of Liability',
    content: `To the maximum extent permitted by law, EaseInventory shall not be liable for indirect, incidental, special, or consequential damages. Our total liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim. This limitation applies regardless of the form of action.`,
  },
  {
    title: 'Termination',
    content: `You may cancel your subscription at any time through the dashboard. We may terminate or suspend accounts for violation of these terms, non-payment, or at our discretion with 30 days notice. Upon termination, your right to use the Service ceases immediately, but you may export your data within the grace period.`,
  },
  {
    title: 'Governing Law',
    content: `These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka. If any provision is found unenforceable, the remaining provisions continue in effect.`,
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">📜</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Legal</span>
              </div>

              <h1 className="heading-lg mb-8">
                Terms of <span className="text-secondary italic">Growth</span>
              </h1>

              <p className="paragraph-lg mb-6 max-w-2xl mx-auto">
                Clear, fair terms that protect both you and us. No legal jargon,
                just straightforward rules for using EaseInventory.
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
            <div className="max-w-4xl mx-auto space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="modern-card">
                    <CardBody className="p-8 lg:p-10">
                      <h2 className="text-xl font-black mb-4 uppercase tracking-tight">{section.title}</h2>
                      <p className="text-foreground/70 leading-relaxed whitespace-pre-line">{section.content}</p>
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
                <Card className="modern-card bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border-secondary/20">
                  <CardBody className="p-8 lg:p-10">
                    <h2 className="text-xl font-black mb-4 uppercase tracking-tight">Questions About These Terms?</h2>
                    <p className="text-foreground/70 mb-4 italic">
                      Contact our legal team for clarification:
                    </p>
                    <a href="mailto:legal@easeinventory.com" className="text-secondary font-bold hover:underline">
                      legal@easeinventory.com
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
