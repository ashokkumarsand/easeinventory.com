'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const trustedLogos = [
  'RetailHub', 'ShopEasy', 'MegaMart', 'QuickFix', 'TechZone',
  'UrbanStore', 'PrimeGoods', 'SwiftRepair',
];

const Hero: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-20 lg:pt-36 lg:pb-28 flex flex-col justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Radial glow behind headline */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(132,204,22,0.08) 0%, transparent 70%)',
          }}
        />
        {/* Subtle cyan accent glow */}
        <div
          className="absolute top-[30%] right-[15%] w-[400px] h-[400px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.04) 0%, transparent 70%)',
          }}
        />
        {/* Dot grid pattern */}
        <div className="dot-grid absolute inset-0" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2.5 glass-badge px-4 py-2.5 rounded-full mb-8 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-lg" aria-hidden="true">🇮🇳</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Made for India
            </span>
            <span className="w-1 h-1 rounded-full bg-foreground/30" aria-hidden="true" />
            <span className="text-xs font-semibold text-foreground/70">
              Trusted by 10,000+ Indian businesses
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 max-w-[800px] mx-auto transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-foreground">Operational</span>{' '}
            <span className="gradient-text italic">Lifting.</span>
            <br />
            <span className="text-foreground">Customer Joy,</span>{' '}
            <span className="gradient-text italic">Realtime.</span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg sm:text-xl text-muted-foreground max-w-[560px] mx-auto leading-relaxed mb-10 transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            WhatsApp alerts and high-precision status tracking.
            Remove the burden of service management in minutes.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row items-center gap-4 justify-center mb-16 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Button
              asChild
              size="lg"
              className="btn-glow font-semibold h-14 px-8 text-base rounded-xl w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Link href="/register" className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="font-semibold h-14 px-8 text-base rounded-xl border-foreground/10 hover:bg-foreground/5 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Link href="#demo" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Trust Section */}
          <div
            className={`transition-all duration-700 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
              Trusted by 10,000+ Indian businesses
            </p>

            {/* Logo Cloud */}
            <div className="relative overflow-hidden max-w-2xl mx-auto">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

              <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
                {trustedLogos.map((name) => (
                  <span
                    key={name}
                    className="text-sm font-bold text-foreground/20 hover:text-foreground/40 transition-colors duration-300 whitespace-nowrap"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
