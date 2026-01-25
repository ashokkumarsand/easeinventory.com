'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import React from 'react';

const features = [
  {
    title: 'Precision Inventory',
    description: 'Track every single unit with serial numbers. Manage cost vs sale prices with automated profit analysis.',
    icon: '📦',
    tag: 'Advanced',
  },
  {
    title: 'Repair Logistics',
    icon: '🔧',
    description: 'Ticketing system with technician benchmarks, photo attachments, and lifecycle tracking.',
    tag: 'Service',
  },
  {
    title: 'Instant GST Bills',
    icon: '📄',
    description: 'Complaint invoicing in seconds. Supporting HSN codes, multiple tax rates, and digital payments.',
    tag: 'Compliance',
  },
  {
    title: 'Smart Alerts',
    icon: '🔔',
    description: 'Auto-notifications for low stock, repair completion via WhatsApp, and urgent supplier dues.',
    tag: 'Automation',
  },
  {
    title: 'Subdomain Hosting',
    icon: '🌐',
    description: 'Your business, your home. Claim your unique .easeinventory.com link with custom branding.',
    tag: 'Identity',
  },
  {
    title: 'Staff Management',
    icon: '👥',
    description: 'Track attendance, calculate performance-based payroll, and manage roles securely.',
    tag: 'HR',
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="section-padding bg-background relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px]" />
      
      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 lg:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Chip variant="flat" color="primary" className="mb-6 font-bold uppercase text-xs">
              Feature Stack
            </Chip>
            <h2 className="heading-lg mb-8">
              Built to manage <span className="text-primary italic">everything.</span>
            </h2>
            <p className="paragraph-lg">
              We combined inventory, repairs, and accounting into one fluid interface 
              designed for the speed of modern Indian retail.
            </p>
          </motion.div>
        </div>

        <div className="layout-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="modern-card group hover:translate-y-[-8px] transition-all duration-500 overflow-visible"
                radius="lg"
              >
                <CardBody className="p-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/5">
                      {feature.icon}
                    </div>
                    <Chip size="sm" variant="dot" color="primary" className="border-none opacity-60">
                       {feature.tag}
                    </Chip>
                  </div>
                  <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/50 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                  
                  <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest cursor-pointer">
                    Learn more 
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
