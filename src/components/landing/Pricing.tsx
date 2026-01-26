'use client';

import { Button, Card, CardBody, Tab, Tabs } from '@heroui/react';
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
    <section id="pricing" className="section-padding bg-background relative overflow-hidden">
      <div className="container-custom relative z-10">
        
        <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-32">
           <div className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-8">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">The Momentum Engine</span>
           </div>
           <h2 className="heading-lg mb-8">
             Select Your <span className="text-secondary italic">Growth Trajectory.</span>
           </h2>
           
            <div className="flex flex-col items-center gap-8 mt-12">
               <Tabs 
                 aria-label="Billing Cycle" 
                 color="primary" 
                 variant="solid"
                 radius="full"
                 size="lg"
                 selectedKey={billingCycle}
                 onSelectionChange={(key) => setBillingCycle(key.toString())}
                 classNames={{
                   tabList: "bg-foreground/5 p-1.5 gap-0 border border-foreground/10 glass",
                   cursor: "shadow-2xl bg-white dark:bg-primary shadow-primary/20",
                   tab: "h-16 px-14",
                   tabContent: "font-black text-sm md:text-base group-data-[selected=true]:text-primary dark:group-data-[selected=true]:text-white tracking-widest uppercase"
                 }}
               >
                 <Tab key="monthly" title="Monthly" />
                 <Tab 
                   key="yearly" 
                   title={
                     <div className="flex items-center gap-4">
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
               <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 animate-bounce text-primary">
                  Limited time launch offer ✦
               </p>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 items-stretch max-w-7xl mx-auto">
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
                className={`modern-card flex-1 p-4 md:p-6 border-none shadow-2xl transition-all duration-700 overflow-visible ${
                  plan.popular 
                    ? 'scale-105 bg-white dark:bg-card-bg shadow-primary/20 ring-1 ring-primary/50' 
                    : 'bg-white/80 dark:bg-card-bg/80 backdrop-blur-md opacity-90'
                }`}
                radius="lg"
              >
                <CardBody className="p-10 md:p-14 flex flex-col h-full relative">
                  {plan.popular && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
                      <div className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.4em] px-8 py-3 rounded-full shadow-xl shadow-primary/40 border border-white/20 whitespace-nowrap">
                        Strategic Choice
                      </div>
                    </div>
                  )}

                  <div className="mb-12 text-center sm:text-left">
                    <h3 className="text-2xl md:text-3xl font-black mb-4 text-foreground uppercase tracking-tighter">{plan.name}</h3>
                    <p className="text-sm font-bold opacity-60 text-foreground leading-relaxed italic">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline justify-center sm:justify-start gap-2 mb-12">
                    <span className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
                      ₹{billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm md:text-lg font-black opacity-30 text-foreground uppercase tracking-widest">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-6 mb-16 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-4 text-base font-bold text-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                           <span className="text-primary text-[10px]">✦</span>
                        </div>
                        <span className="leading-snug opacity-90">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    as={Link}
                    href="/register"
                    color={plan.popular ? 'primary' : 'default'}
                    variant={plan.popular ? 'solid' : 'bordered'}
                    className={`w-full font-black h-20 shadow-2xl text-xl uppercase tracking-[0.2em] ${
                      plan.popular ? 'shadow-primary/30' : 'border-foreground/10 text-foreground'
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
