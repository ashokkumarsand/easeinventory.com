'use client';

import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const stats = [
  { value: '10K+', label: 'Active Businesses' },
  { value: '50L+', label: 'Products Tracked' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const features = [
  'Multi-location inventory',
  'GST-compliant invoicing',
  'Real-time analytics',
];

const Hero: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-20 lg:pt-36 lg:pb-32 flex flex-col justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Primary gradient orb */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/15 rounded-full blur-[150px] animate-float" />
        {/* Secondary gradient orb */}
        <div className="absolute bottom-[-20%] left-[-15%] w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[180px] animate-float animation-delay-2000" />
        {/* Accent gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px]" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Combined Badge */}
            <div
              className={`inline-flex items-center gap-2.5 glass-badge px-4 py-2.5 rounded-full mb-8 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="text-lg">🇮🇳</span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Made for India
              </span>
              <span className="w-1 h-1 rounded-full bg-foreground/30" />
              <span className="text-xs font-semibold text-foreground/70">
                Trusted by 10,000+ Indian businesses
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-100 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="text-foreground">Inventory</span>
              <br />
              <span className="gradient-text">Made Simple</span>
            </h1>

            {/* Subheadline */}
            <p
              className={`text-lg sm:text-xl text-foreground/60 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8 transition-all duration-700 delay-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              The all-in-one platform for Indian retailers and repair shops.
              Manage stock, repairs, and invoices with{' '}
              <span className="text-foreground font-medium">GST compliance built-in</span>.
            </p>

            {/* Feature Pills */}
            <div
              className={`flex flex-wrap justify-center lg:justify-start gap-3 mb-10 transition-all duration-700 delay-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm font-medium text-foreground/80"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  {feature}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12 transition-all duration-700 delay-400 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Button
                asChild
                size="lg"
                className="btn-glow font-semibold h-14 px-8 text-base rounded-xl w-full sm:w-auto"
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
                <Link href="#demo" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div
              className={`flex flex-wrap justify-center lg:justify-start gap-8 pt-8 border-t border-foreground/10 transition-all duration-700 delay-500 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-black text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div
            className={`order-1 lg:order-2 transition-all duration-1000 delay-300 ${
              mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <div className="relative px-4 py-8 lg:px-0 lg:py-0">
              {/* Glow effect behind mockup */}
              <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-75" aria-hidden="true" />

              {/* Main mockup card */}
              <div className="glass-card relative p-1 rounded-3xl">
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-blue-500/20 rounded-3xl pointer-events-none" />

                {/* Inner content */}
                <div className="relative bg-background-secondary/80 backdrop-blur-xl rounded-[22px] p-6 min-h-[420px] overflow-visible">
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Logo size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          yourshop.easeinventory.com
                        </p>
                        <p className="text-xs text-foreground/50">Dashboard</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs text-foreground/50">Live</span>
                    </div>
                  </div>

                  {/* Revenue Today - Highlighted Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                          <span className="text-lg">📈</span>
                        </div>
                        <div>
                          <p className="text-xs text-foreground/50">Revenue Today</p>
                          <p className="text-xl font-black text-foreground">₹1.2L</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-primary font-bold">+18%</span>
                        <p className="text-[10px] text-foreground/40">vs yesterday</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="glass-card p-3 rounded-xl">
                      <p className="text-[10px] font-medium text-foreground/50 mb-1">
                        Total Products
                      </p>
                      <p className="text-lg font-black text-foreground">2,482</p>
                      <span className="text-[10px] text-primary font-medium">+12%</span>
                    </div>
                    <div className="glass-card p-3 rounded-xl">
                      <p className="text-[10px] font-medium text-foreground/50 mb-1">
                        Stock Value
                      </p>
                      <p className="text-lg font-black text-foreground">₹14.2L</p>
                      <span className="text-[10px] text-primary font-medium">+8%</span>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                      Recent Activity
                    </p>
                    {[
                      {
                        icon: '📦',
                        title: 'iPhone 15 Pro Max',
                        subtitle: 'Stock updated',
                        badge: '+5',
                        badgeColor: 'bg-primary/20 text-primary',
                      },
                      {
                        icon: '🔧',
                        title: 'MacBook Repair #1042',
                        subtitle: 'Completed',
                        badge: 'Done',
                        badgeColor: 'bg-green-500/20 text-green-500',
                      },
                      {
                        icon: '📄',
                        title: 'Invoice #INV-2024-156',
                        subtitle: 'Generated',
                        badge: '₹24K',
                        badgeColor: 'bg-blue-500/20 text-blue-500',
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.05] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-lg">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-foreground/50">{item.subtitle}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                    ))}
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

export default Hero;
