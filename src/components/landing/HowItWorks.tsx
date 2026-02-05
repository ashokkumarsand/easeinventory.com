'use client';

import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Globe, Package, Rocket } from 'lucide-react';
import Link from 'next/link';
import React, { useRef } from 'react';

const steps = [
  {
    number: '01',
    label: 'RAPID MOBILIZATION',
    title: 'Deploy Your Engine',
    description: 'Deploy your .easeinventory.com engine with a unique subdomain in seconds.',
    icon: Globe,
    delay: 0,
  },
  {
    number: '02',
    label: 'ONBOARD INVENTORY',
    title: 'Lift Your Catalog',
    description: 'Lift catalog via Excel import or manual entry with photos and serial tracking.',
    icon: Package,
    delay: 0.2,
  },
  {
    number: '03',
    label: 'LAUNCH & DEPLOY',
    title: 'Start Selling',
    description: 'Start selling, tracking repairs, and lifting revenue with GST invoicing.',
    icon: Rocket,
    delay: 0.4,
  },
];

const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Operational Protocol
            </span>
          </div>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-[800px] mx-auto"
          >
            Operational Protocols.
            <span className="gradient-text block">
              We removed the friction of legacy ERP gravity.
            </span>
          </h2>
        </motion.div>

        {/* Horizontal Stepper */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line — visible when steps are in a row */}
          <div className="absolute top-[36px] left-[16.67%] right-[16.67%] h-px hidden md:block" aria-hidden="true">
            <div className="w-full h-full bg-foreground/5" />
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-cyan-400"
              initial={{ width: '0%' }}
              animate={{ width: isInView ? '100%' : '0%' }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  className="group text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: step.delay + 0.3 }}
                >
                  {/* Step Number */}
                  <div className="flex justify-center mb-5">
                    <div className="w-[72px] h-[72px] rounded-2xl feature-card flex items-center justify-center group-hover:border-primary/20 transition-all duration-300">
                      <span className="text-3xl font-black text-primary">{step.number}</span>
                    </div>
                  </div>

                  {/* Label */}
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
                    {step.label}
                  </p>

                  {/* Title */}
                  <h3 className="text-lg font-bold mb-3 text-foreground">
                    {step.title}
                  </h3>

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <Link href="/register">
            <Button
              size="lg"
              className="btn-glow font-semibold px-8 h-14 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
