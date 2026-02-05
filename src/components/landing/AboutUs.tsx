'use client';

import { CheckCircle2, Rocket, Target, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'Built specifically for Indian retail businesses with local compliance and language support.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized infrastructure hosted in Mumbai for sub-100ms response times.',
  },
  {
    icon: Rocket,
    title: 'Scale Ready',
    description: 'From single shops to franchise chains, grow without changing systems.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<100ms', label: 'Response Time' },
  { value: '24/7', label: 'Support' },
];

const AboutUs: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground/80">Our Mission</span>
            </div>

            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6"
            >
              Built for
              <span className="gradient-text block">Indian businesses</span>
            </h2>

            <p className="text-lg text-foreground/60 leading-relaxed mb-8">
              We understand the unique challenges of running a retail or service business
              in India. That&apos;s why we built EaseInventory with GST compliance,
              multi-language support, and local payment integrations from day one.
            </p>

            {/* Values */}
            <div className="space-y-4 mb-8">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{value.title}</h3>
                      <p className="text-sm text-foreground/60">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-foreground/5">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-black text-primary">{stat.value}</p>
                  <p className="text-xs text-foreground/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full scale-75" aria-hidden="true" />

              {/* Main visual container */}
              <div className="glass-card relative p-8 rounded-3xl">
                {/* Abstract visual */}
                <div className="aspect-square bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Animated rocket */}
                  <div className="animate-float">
                    <Rocket className="w-24 h-24 text-primary/30" />
                  </div>

                  {/* Decorative circles */}
                  <div className="absolute inset-8 border-2 border-dashed border-foreground/5 rounded-full" />
                  <div className="absolute inset-16 border-2 border-dashed border-primary/10 rounded-full" />

                  {/* Glowing center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Floating stat card */}
                <div className="absolute -bottom-4 -right-4 sm:bottom-4 sm:right-4 glass-card p-4 rounded-2xl shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/50">Uptime</p>
                      <p className="text-xl font-black text-foreground">99.9%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
