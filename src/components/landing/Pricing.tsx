'use client';

import { Button, Card, CardBody, Chip, Tab, Tabs } from '@heroui/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';

const plans = [
  {
    name: 'Starter Accelerator',
    description: 'Perfect for local shops starting their digital journey',
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: 'forever',
    features: [
      'Single Admin Seat',
      '100 Inventory Items',
      'Basic Invoicing',
      'Community Support',
    ],
    cta: 'Start Accelerating',
    popular: false,
  },
  {
    name: 'Business Catalyst',
    description: 'The definitive solution for scaling franchises',
    monthlyPrice: 1499,
    yearlyPrice: 1199,
    period: '/mo',
    features: [
      'Up to 10 User Seats',
      'Unlimited Inventory',
      'Repair Center Management',
      'HR & Attendance Engine',
      'GST Invoicing Terminal',
      'WhatsApp Automation',
      'Priority Support',
    ],
    cta: 'Ignite Growth',
    popular: true,
  },
  {
    name: 'Elite Commander',
    description: 'Complete sovereignty for large-scale operations',
    monthlyPrice: 4999,
    yearlyPrice: 3999,
    period: '/mo',
    features: [
      'Unlimited Enterprise Seats',
      'Sub-Admin Rights Delegation',
      'Logistics & Fleet Command',
      'B2B Dispatch Manifests',
      'Advanced API Access',
      'Dedicated Success Manager',
    ],
    cta: 'Command Your Empire',
    popular: false,
  },
];

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <section id="pricing" className="section-padding bg-cream dark:bg-dark-bg relative overflow-hidden">
      <div className="container-custom relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
           <Chip 
            variant="flat" 
            color="secondary" 
            className="mb-6 font-bold uppercase text-[10px] tracking-widest px-4"
           >
              The Momentum Engine
           </Chip>
           <h2 className="heading-lg mb-8 text-dark dark:text-white">
             Select Your <span className="text-secondary italic">Growth Trajectory.</span>
           </h2>
           
            <div className="flex flex-col items-center gap-6 mt-10">
               <Tabs 
                 aria-label="Billing Cycle" 
                 color="primary" 
                 variant="solid"
                 radius="full"
                 size="lg"
                 selectedKey={billingCycle}
                 onSelectionChange={(key) => setBillingCycle(key.toString())}
                 classNames={{
                   tabList: "bg-black/5 dark:bg-white/5 p-1.5 gap-0 border border-black/10 dark:border-white/10 glass",
                   cursor: "shadow-2xl bg-white dark:bg-primary shadow-primary/20",
                   tab: "h-14 px-12",
                   tabContent: "font-black text-sm md:text-base group-data-[selected=true]:text-primary dark:group-data-[selected=true]:text-white tracking-wide"
                 }}
               >
                 <Tab key="monthly" title="Monthly" />
                 <Tab 
                   key="yearly" 
                   title={
                     <div className="flex items-center gap-3">
                        <span>Yearly</span>
                        <div className="relative">
                          <div className="absolute inset-0 bg-success blur-md opacity-40 animate-pulse rounded-full" />
                          <div className="relative bg-success text-white text-[10px] px-3 py-1 rounded-full font-black tracking-tighter shadow-lg">
                            SAVE 20%
                          </div>
                        </div>
                     </div>
                   } 
                 />
               </Tabs>
               <p className="text-xs font-bold opacity-40 uppercase tracking-[0.2em] animate-bounce">
                  Limited time launch offer ✦
               </p>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-4 md:px-0">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${plan.popular ? 'z-10' : ''}`}
            >
              <Card 
                className={`modern-card flex-1 p-2 md:p-4 border-none shadow-2xl transition-all duration-700 overflow-visible ${
                  plan.popular 
                    ? 'scale-105 bg-white dark:bg-dark-card shadow-primary/20 ring-1 ring-primary/50' 
                    : 'bg-white/80 dark:bg-dark-card/80 backdrop-blur-md opacity-90'
                }`}
                radius="lg"
              >
                <CardBody className="p-8 md:p-12 flex flex-col h-full relative">
                  {plan.popular && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
                      <div className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-xl shadow-primary/30 border border-white/20">
                        Strategic Choice
                      </div>
                    </div>
                  )}

                  <div className="mb-10 text-center sm:text-left">
                    <h3 className="text-xl md:text-2xl font-black mb-2 text-dark dark:text-white uppercase tracking-tight">{plan.name}</h3>
                    <p className="text-xs md:text-sm font-bold opacity-60 text-dark dark:text-white leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline justify-center sm:justify-start gap-1 mb-10 overflow-hidden">
                    <span className="text-3xl md:text-5xl font-black text-dark dark:text-white">
                      ₹{billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm md:text-base font-bold opacity-50 text-dark dark:text-white whitespace-nowrap">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-4 text-sm font-bold opacity-90 text-dark dark:text-white">
                        <span className="text-primary mt-0.5 shrink-0">✦</span>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    as={Link}
                    href="/register"
                    color={plan.popular ? 'primary' : 'default'}
                    variant={plan.popular ? 'solid' : 'bordered'}
                    className={`w-full font-black h-12 md:h-14 shadow-lg text-lg ${
                      plan.popular ? 'shadow-primary/30' : 'border-dark/10 dark:border-white/10 dark:text-white'
                    }`}
                    radius="full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
