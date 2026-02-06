'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Stat {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface CoreFeature {
  icon: LucideIcon;
  title: string;
  tag: string;
  description: string;
  highlights: string[];
}

interface Step {
  number: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface ExtraFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export interface FeaturePageConfig {
  badge: string;
  hero: {
    title: React.ReactNode;
    subtitle: string;
    trustItems: string[];
  };
  stats: Stat[];
  coreFeatures: CoreFeature[];
  steps: Step[];
  extraFeatures: ExtraFeature[];
  faqs: FAQ[];
  cta: {
    icon: LucideIcon;
    title: React.ReactNode;
    subtitle: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Template Component                                                 */
/* ------------------------------------------------------------------ */

export default function FeaturePageTemplate({ config }: { config: FeaturePageConfig }) {
  return (
    <main className="min-h-screen overflow-hidden">
      <HeroSection config={config} />
      <CoreFeaturesSection features={config.coreFeatures} />
      <HowItWorksSection steps={config.steps} />
      <ExtraFeaturesSection features={config.extraFeatures} />
      <FAQSection faqs={config.faqs} />
      <CTASection cta={config.cta} />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function HeroSection({ config }: { config: FeaturePageConfig }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="relative min-h-screen pt-28 pb-20 lg:pt-36 lg:pb-28 flex flex-col justify-center overflow-hidden"
      aria-label={config.badge}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(132,204,22,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[30%] right-[15%] w-[400px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.04) 0%, transparent 70%)' }}
        />
        <div className="dot-grid absolute inset-0" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.7 }}
          >
            <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                {config.badge}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-6">
              {config.hero.title}
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10">
              {config.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <Button
                asChild
                size="lg"
                className="btn-glow font-semibold h-14 px-8 text-base rounded-xl w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="font-semibold h-14 px-8 text-base rounded-xl border-foreground/10 hover:bg-foreground/5 w-full sm:w-auto"
              >
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6">
              {config.hero.trustItems.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 gap-5"
          >
            {config.stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="feature-card group hover:scale-[1.03] transition-transform duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <p className="text-3xl font-black text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Core Features                                                      */
/* ------------------------------------------------------------------ */

function CoreFeaturesSection({ features }: { features: CoreFeature[] }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="features" ref={ref} className="section-padding relative overflow-hidden" aria-labelledby="core-features-heading">
      <div className="container-custom relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Core Features
            </span>
          </div>
          <h2 id="core-features-heading" className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6">
            Everything You Need
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="feature-card h-full group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-foreground/[0.03] border border-foreground/5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {feature.highlights.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-xs text-foreground/70">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How It Works                                                       */
/* ------------------------------------------------------------------ */

function HowItWorksSection({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="section-padding relative overflow-hidden" aria-labelledby="steps-heading">
      <div className="container-custom relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              How It Works
            </span>
          </div>
          <h2 id="steps-heading" className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            Get Started in{' '}
            <span className="gradient-text">3 Steps</span>
          </h2>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="absolute top-[36px] left-[16.67%] right-[16.67%] h-px hidden md:block" aria-hidden="true">
            <div className="w-full h-full bg-foreground/5" />
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-cyan-400"
              initial={{ width: '0%' }}
              animate={{ width: isInView ? '100%' : '0%' }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  className="group text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: Number(step.number) * 0.2 + 0.1 }}
                >
                  <div className="flex justify-center mb-5">
                    <div className="w-[72px] h-[72px] rounded-2xl feature-card flex items-center justify-center group-hover:border-primary/20 transition-all duration-300">
                      <span className="text-3xl font-black text-primary">{step.number}</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">
                    {step.label}
                  </p>
                  <h3 className="text-lg font-bold mb-3 text-foreground">{step.title}</h3>
                  <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Extra Features                                                     */
/* ------------------------------------------------------------------ */

function ExtraFeaturesSection({ features }: { features: ExtraFeature[] }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} className="section-padding relative overflow-hidden" aria-labelledby="extra-features-heading">
      <div className="container-custom relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Advanced
            </span>
          </div>
          <h2 id="extra-features-heading" className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            And That&apos;s{' '}
            <span className="gradient-text">Not All</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <div className="feature-card h-full group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQs                                                               */
/* ------------------------------------------------------------------ */

function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} className="section-padding relative overflow-hidden" aria-labelledby="faq-section-heading">
      <div className="container-custom relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              FAQs
            </span>
          </div>
          <h2 id="faq-section-heading" className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            Got Questions?
          </h2>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="feature-card !p-0 overflow-hidden border-none data-[state=open]:ring-1 data-[state=open]:ring-primary/20"
              >
                <AccordionTrigger className="px-6 py-5 text-left font-semibold text-base text-foreground hover:text-primary hover:no-underline transition-colors [&[data-state=open]]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA                                                                */
/* ------------------------------------------------------------------ */

function CTASection({ cta }: { cta: FeaturePageConfig['cta'] }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const Icon = cta.icon;

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" aria-labelledby="feature-cta-heading">
      <div className="max-w-[900px] mx-auto relative z-10">
        <motion.div
          className="relative rounded-3xl p-8 sm:p-12 lg:p-20 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(132,204,22,0.05), rgba(34,211,238,0.05))',
            border: '1px solid var(--glass-border)',
          }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.7 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-8">
            <Icon className="w-8 h-8" />
          </div>

          <h2 id="feature-cta-heading" className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-[700px] mx-auto">
            {cta.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            {cta.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="btn-glow font-semibold h-14 px-8 text-base rounded-xl w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Link href="/register" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="font-semibold h-14 px-8 text-base rounded-xl border-foreground/10 hover:bg-foreground/5 w-full sm:w-auto"
            >
              <Link href="/#contact">Talk to Sales</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
