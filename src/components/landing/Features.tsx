'use client';

import {
  ArrowRight,
  Bell,
  Bot,
  Building2,
  FileText,
  Globe,
  LineChart,
  Link2,
  PackageSearch,
  Truck,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

const features = [
  {
    title: 'Precision Inventory',
    description:
      'Track every unit with serial numbers. Automated cost vs sale price profit analysis.',
    icon: PackageSearch,
    href: '/features/inventory',
  },
  {
    title: 'Repair Logistics',
    description:
      'Ticketing with technician benchmarks, photo attachments, and lifecycle tracking.',
    icon: Wrench,
    href: '/features/repairs',
  },
  {
    title: 'Instant GST Bills',
    description:
      'Compliant invoicing in seconds. HSN codes, multiple tax rates, digital payments.',
    icon: FileText,
    href: '/features/billing',
  },
  {
    title: 'Smart Alerts',
    description:
      'Auto-notifications for low stock, repair completion via WhatsApp, urgent supplier dues.',
    icon: Bell,
    href: '/features/alerts',
  },
  {
    title: 'Subdomain Hosting',
    description:
      'Claim your unique .easeinventory.com link with custom branding.',
    icon: Globe,
    href: '/features/subdomain',
  },
  {
    title: 'Staff Management',
    description:
      'Attendance tracking, performance-based payroll, and secure role management.',
    icon: Users,
    href: '/features/staff',
  },
  {
    title: 'Warehouse & Orders',
    description:
      'Sales orders, procurement, shipping, returns, wave planning and pick lists in one flow.',
    icon: Warehouse,
    href: '/features/warehouse',
  },
  {
    title: 'Supply Chain',
    description:
      'Multi-supplier management, BOM/kits, inventory valuation, payment terms and order smoothing.',
    icon: Link2,
    href: '/features/supply-chain',
  },
  {
    title: 'Intelligence',
    description:
      'Demand forecasting, safety stock, ABC/XYZ analysis, and assortment planning powered by data.',
    icon: LineChart,
    href: '/features/intelligence',
  },
  {
    title: 'Automation',
    description:
      'Workflow rules, auto-reorder, scheduled reports, webhooks and bulk operations.',
    icon: Bot,
    href: '/features/automation',
  },
  {
    title: 'Multi-Location',
    description:
      'Inter-location transfers, lateral transshipment, placement optimizer and capacity management.',
    icon: Truck,
    href: '/features/multi-location',
  },
  {
    title: 'Enterprise Suite',
    description:
      'API access, SSO, white label, multi-echelon optimization, lot genealogy and SLA management.',
    icon: Building2,
    href: '/features/enterprise',
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
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
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 lg:mb-20 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Precision Stack
            </span>
          </div>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-[800px] mx-auto"
          >
            Engineered to manage
            <span className="gradient-text block">Absolute Zero chaos.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Inventory, warehouse ops, supply chain, analytics and automation —
            all unified in one platform designed for Indian businesses.
          </p>
        </div>

        {/* Features Grid — 3x4 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className={`feature-card group transition-all duration-700 block no-underline ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <article>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Learn More arrow */}
                  <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all duration-300">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
