'use client';

import WaveBackground from '@/components/landing/WaveBackground';
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle, Globe, Package, Rocket, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useRef } from 'react';

const steps = [
  {
    number: 1,
    title: 'Sign Up',
    description: 'Create your account and get your unique subdomain instantly.',
    icon: Globe,
    gradient: 'from-primary to-emerald-400',
    delay: 0,
  },
  {
    number: 2,
    title: 'Add Inventory',
    description: 'Import via Excel or add products manually with photos and tracking.',
    icon: Package,
    gradient: 'from-blue-500 to-cyan-400',
    delay: 0.2,
  },
  {
    number: 3,
    title: 'Start Selling',
    description: 'Begin operations with GST invoicing and real-time analytics.',
    icon: Rocket,
    gradient: 'from-orange-500 to-amber-400',
    delay: 0.4,
  },
];

// Animated progress line that spans full width
const ProgressLine = ({ isInView }: { isInView: boolean }) => (
  <div className="absolute top-[50px] left-0 right-0 h-[2px] hidden lg:block overflow-hidden">
    {/* Background track - full width */}
    <div className="absolute inset-0 bg-foreground/5" />
    {/* Animated fill - full width */}
    <motion.div
      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-blue-500 to-orange-500"
      initial={{ width: '0%' }}
      animate={{ width: isInView ? '100%' : '0%' }}
      transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
    />
    {/* Glow effect */}
    <motion.div
      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-blue-500 to-orange-500 blur-md opacity-60"
      initial={{ width: '0%' }}
      animate={{ width: isInView ? '100%' : '0%' }}
      transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
    />
    {/* Moving light particle */}
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 w-20 h-4 bg-white/80 blur-md rounded-full"
      initial={{ left: '-10%', opacity: 0 }}
      animate={isInView ? { left: '110%', opacity: [0, 1, 1, 0] } : { left: '-10%', opacity: 0 }}
      transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
    />
  </div>
);

// Step card component with consistent height
const StepCard = ({
  step,
  isInView,
}: {
  step: (typeof steps)[0];
  isInView: boolean;
}) => {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: step.delay + 0.5 }}
      className="relative flex flex-col items-center"
    >
      {/* Animated icon circle */}
      <motion.div
        className="relative z-10 mb-6"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: step.delay + 0.3,
        }}
      >
        {/* Outer glow ring */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.gradient} blur-xl opacity-40`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: step.delay,
          }}
        />
        {/* Main circle - icon only */}
        <div
          className={`relative w-[100px] h-[100px] rounded-full bg-gradient-to-br ${step.gradient} p-[3px]`}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)',
            }}
          >
            <Icon className="w-10 h-10 text-foreground/80" />
          </div>
        </div>
        {/* Checkmark indicator */}
        <motion.div
          className="absolute -right-1 -top-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ delay: step.delay + 0.8, type: 'spring' }}
        >
          <CheckCircle className="w-4 h-4 text-primary-foreground" />
        </motion.div>
      </motion.div>

      {/* Content with number above title */}
      <div className="text-center w-full max-w-xs flex flex-col items-center">
        {/* Step number badge above title */}
        <motion.div
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${step.gradient} mb-2`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ delay: step.delay + 0.55 }}
        >
          <span className="text-sm font-black text-white">{step.number}</span>
        </motion.div>

        <motion.h3
          className="text-xl font-bold mb-2 font-heading"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: step.delay + 0.6 }}
        >
          {step.title}
        </motion.h3>

        <motion.p
          className="text-sm text-foreground/50 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: step.delay + 0.7 }}
        >
          {step.description}
        </motion.p>
      </div>
    </motion.div>
  );
};

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
      {/* Wave Background */}
      <WaveBackground variant="minimal" fadeTop fadeBottom />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'linear-gradient(180deg, rgba(132, 204, 22, 0.1) 0%, rgba(132, 204, 22, 0.05) 100%)',
              border: '1px solid rgba(132, 204, 22, 0.2)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.1 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary">
              Quick Setup
            </span>
          </motion.div>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 font-heading"
          >
            Get started in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              three simple steps
            </span>
          </h2>
          <p className="text-lg text-foreground/50 max-w-2xl mx-auto">
            No complex setup, no technical knowledge required. Start managing your
            inventory in minutes.
          </p>
        </motion.div>

        {/* Steps with Progress Line */}
        <div className="relative">
          {/* Progress line - full width */}
          <ProgressLine isInView={isInView} />

          {/* Steps grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {steps.map((step) => (
              <StepCard key={step.number} step={step} isInView={isInView} />
            ))}
          </div>
        </div>

        {/* Animated completion message */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
            style={{
              background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
            }}
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 1.8, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              That&apos;s it! You&apos;re ready to go
            </span>
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <Link href="/register">
            <Button
              size="lg"
              className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20"
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
