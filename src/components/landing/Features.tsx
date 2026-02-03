'use client';

import { Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

const features = [
  {
    title: 'Precision Inventory',
    description: 'Track every single unit with serial numbers. Manage cost vs sale prices with automated profit analysis.',
    icon: '📦',
    tag: 'Advanced',
    href: '/features/inventory',
  },
  {
    title: 'Repair Logistics',
    icon: '🔧',
    description: 'Ticketing system with technician benchmarks, photo attachments, and lifecycle tracking.',
    tag: 'Service',
    href: '/features/repairs',
  },
  {
    title: 'Instant GST Bills',
    icon: '📄',
    description: 'Complaint invoicing in seconds. Supporting HSN codes, multiple tax rates, and digital payments.',
    tag: 'Compliance',
    href: '/features/billing',
  },
  {
    title: 'Smart Alerts',
    icon: '🔔',
    description: 'Auto-notifications for low stock, repair completion via WhatsApp, and urgent supplier dues.',
    tag: 'Automation',
    href: '/features/alerts',
  },
  {
    title: 'Subdomain Hosting',
    icon: '🌐',
    description: 'Your business, your home. Claim your unique .easeinventory.com link with custom branding.',
    tag: 'Identity',
    href: '/features/subdomain',
  },
  {
    title: 'Staff Management',
    icon: '👥',
    description: 'Track attendance, calculate performance-based payroll, and manage roles securely.',
    tag: 'HR',
    href: '/features/staff',
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="section-padding bg-background relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-24 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full w-fit">
               <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap leading-relaxed pt-0.5">Precision Stack</span>
            </div>
            <h2 className="heading-lg">
              Engineered to manage <br />
              <span className="text-primary italic">Absolute Zero</span> chaos.
            </h2>
            <p className="paragraph-lg italic">
              We combined inventory, repairs, and accounting into one fluid interface 
              designed for the speed of modern Indian retail.
            </p>
          </motion.div>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 -mx-6 px-6 md:mx-auto md:px-0 pb-8 md:pb-0">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="shrink-0 snap-center w-[85vw] md:w-auto h-full"
            >
              <Link href={feature.href} className="block h-full">
                <Card 
                  className="modern-card group h-full hover:border-primary/30 transition-all duration-700 overflow-visible cursor-pointer"
                  radius="lg"
                >
                  <CardBody className="p-10 lg:p-12 flex flex-col items-start text-left h-full">
                    <div className="flex justify-between items-start w-full mb-12">
                      <div className="w-20 h-20 rounded-[32px] bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-all duration-500 shadow-sm border border-primary/5">
                        {feature.icon}
                      </div>
                      <div className="bg-foreground/[0.03] dark:bg-white/5 px-4 py-1.5 rounded-full border border-foreground/[0.05] dark:border-white/10">
                         <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{feature.tag}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black mb-6 group-hover:text-primary transition-colors text-foreground uppercase tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/60 leading-relaxed text-sm md:text-lg font-medium italic mb-8 flex-1">
                      {feature.description}
                    </p>
                    
                    <div className="mt-auto pt-6 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] group-hover:gap-4 transition-all">
                      Learn More 
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

