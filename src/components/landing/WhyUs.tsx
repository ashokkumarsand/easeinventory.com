'use client';

import WaveBackground from '@/components/landing/WaveBackground';
import { motion } from 'framer-motion';
import { Check, Globe, IndianRupee, Smartphone, Sparkles } from 'lucide-react';
import React from 'react';

const reasons = [
  {
    icon: Globe,
    title: 'India-First',
    description: 'Built for GST, UPI, and Indian compliance from day one.',
    highlights: ['GST-ready invoicing', 'UPI payments', 'Multi-language support'],
  },
  {
    icon: Sparkles,
    title: 'Zero Learning Curve',
    description: 'WhatsApp-like simplicity. If you can text, you can use EaseInventory.',
    highlights: ['Intuitive interface', 'Quick onboarding', 'No training needed'],
  },
  {
    icon: IndianRupee,
    title: 'Affordable Scaling',
    description: 'Start free, pay only when you grow. No hidden surprises.',
    highlights: ['Free tier forever', 'Pay-as-you-grow', 'Transparent pricing'],
  },
  {
    icon: Smartphone,
    title: 'Mobile-Ready',
    description: 'Manage your business from any device, anywhere, anytime.',
    highlights: ['Works on all devices', 'Offline mode', 'Real-time sync'],
  },
];

const WhyUs: React.FC = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Wave Background with fade */}
      <WaveBackground variant="features" fadeTop fadeBottom />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 font-heading">
            Built Different. <span className="text-primary">Built Better.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto">
            We didn&apos;t just copy the West. We engineered for India&apos;s unique challenges.
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {reasons.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 md:p-10 rounded-[2rem] transition-all duration-500"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-black transition-all duration-500 text-primary">
                  <reason.icon size={24} />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-sm md:text-base text-white/40 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {reason.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2 text-sm font-medium text-white/60">
                        <Check size={14} className="text-primary" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
