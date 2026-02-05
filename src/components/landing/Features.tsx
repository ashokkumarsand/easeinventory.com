'use client';

import {
  ArrowRight,
  BarChart3,
  Bell,
  FileText,
  Globe,
  Package,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

const features = [
  {
    title: 'Smart Inventory',
    description:
      'Track every unit with serial numbers, manage cost vs sale prices, and get automated profit analysis.',
    icon: Package,
    tag: 'Core',
    href: '/features/inventory',
    color: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
  },
  {
    title: 'Repair Management',
    description:
      'Complete ticketing system with technician assignment, photo attachments, and lifecycle tracking.',
    icon: Wrench,
    tag: 'Service',
    href: '/features/repairs',
    color: 'from-blue-500/20 to-blue-500/5',
    iconColor: 'text-blue-500',
  },
  {
    title: 'GST Invoicing',
    description:
      'Generate compliant invoices in seconds with HSN codes, multiple tax rates, and e-invoicing.',
    icon: FileText,
    tag: 'Compliance',
    href: '/features/billing',
    color: 'from-orange-500/20 to-orange-500/5',
    iconColor: 'text-orange-500',
  },
  {
    title: 'Smart Alerts',
    description:
      'Auto-notifications for low stock, repair completion via WhatsApp, and payment reminders.',
    icon: Bell,
    tag: 'Automation',
    href: '/features/alerts',
    color: 'from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Custom Subdomain',
    description:
      'Get your unique yourshop.easeinventory.com link with custom branding and public catalog.',
    icon: Globe,
    tag: 'Branding',
    href: '/features/subdomain',
    color: 'from-cyan-500/20 to-cyan-500/5',
    iconColor: 'text-cyan-500',
  },
  {
    title: 'Team Management',
    description:
      'Track attendance, calculate payroll, assign roles, and manage permissions securely.',
    icon: Users,
    tag: 'HR',
    href: '/features/staff',
    color: 'from-pink-500/20 to-pink-500/5',
    iconColor: 'text-pink-500',
  },
];

const Features: React.FC = () => {
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
      id="features"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 lg:mb-20 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground/80">
              Powerful Features
            </span>
          </div>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6"
          >
            Everything you need to
            <span className="gradient-text block">manage your business</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            We combined inventory, repairs, and accounting into one fluid interface
            designed for the speed of modern Indian retail.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className={`group block transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <article className="feature-card h-full">
                  {/* Header with icon and tag */}
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-foreground/[0.03] border border-foreground/5 text-xs font-medium text-foreground/50">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/60 text-sm leading-relaxed mb-6 flex-1">
                    {feature.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-16 transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-foreground/50 mb-4">
            And much more including analytics, reports, and integrations
          </p>
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            View all features
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;
