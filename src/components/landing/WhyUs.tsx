'use client';

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
    <section className="py-20 md:py-32 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
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
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Built Different. <span className="text-primary italic">Built Better.</span>
          </h2>
          <p className="text-lg md:text-xl font-bold text-white/40 max-w-2xl mx-auto italic">
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
              className="group p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all duration-500"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                  <reason.icon size={24} />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-sm md:text-base font-bold text-white/40 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {reason.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2 text-sm font-bold text-white/60">
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
