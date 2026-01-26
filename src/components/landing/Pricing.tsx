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
    monthlyPrice: 1999,
    yearlyPrice: 1599,
    period: '/mo',
    features: [
      'Up to 10 User Seats',
      'Unlimited Inventory',
      'Repair Center Management',
      'GST Invoicing Terminal',
      'No WhatsApp Automation',
      'No Device Attendance',
    ],
    cta: 'Ignite Growth',
    popular: false,
  },
  {
    name: 'Growth Engine',
    description: 'Full-scale operational power for serious businesses',
    monthlyPrice: 3500,
    yearlyPrice: 2800,
    period: '/mo',
    features: [
      'Up to 20 User Seats',
      'WhatsApp Integration',
      'Device Attendance Mgmt',
      'Priority Support',
      'Advanced Logistics',
      'Profit Analytics',
    ],
    cta: 'Scale Faster',
    popular: true,
  },
  {
    name: 'Empire Command',
    description: 'Complete sovereignty for large-scale operations',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    period: '',
    features: [
      'Unlimited Enterprise Seats',
      'Sub-Admin Rights Delegation',
      'Logistics & Fleet Command',
      'B2B Dispatch Manifests',
      'Advanced API Access',
      'Dedicated Success Manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('Growth Engine');

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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-[90rem] mx-auto">
          {plans.map((plan, index) => {
            const isSelected = selectedPlan === plan.name;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex cursor-pointer ${isSelected ? 'z-20 scale-105' : 'scale-100'} transition-transform duration-500`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                <Card 
                  className={`modern-card flex-1 p-4 border-none shadow-2xl transition-all duration-500 overflow-visible relative ${
                    isSelected
                      ? 'bg-white dark:bg-card-bg shadow-primary/30 ring-2 ring-primary' 
                      : 'bg-white/60 dark:bg-card-bg/60 backdrop-blur-md opacity-80 hover:opacity-100 ring-1 ring-foreground/5'
                  }`}
                  radius="lg"
                  isPressable
                  onPress={() => setSelectedPlan(plan.name)}
                >
                  <CardBody className="p-8 flex flex-col h-full relative">
                    {isPopular && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
                        <div className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full shadow-xl shadow-primary/40 border border-white/20 whitespace-nowrap">
                          Recommended
                        </div>
                      </div>
                    )}

                    <div className="mb-8 text-center sm:text-left">
                      <h3 className={`text-xl font-black mb-3 uppercase tracking-tighter ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {plan.name}
                      </h3>
                      <p className="text-xs font-bold opacity-60 text-foreground leading-relaxed italic line-clamp-2 md:min-h-[2.5em]">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-center sm:justify-start gap-1 mb-8">
                      <span className={`text-4xl font-black tracking-tighter ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                        {typeof plan.monthlyPrice === 'number' 
                          ? `₹${billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}`
                          : plan.monthlyPrice
                        }
                      </span>
                      <span className="text-xs font-black opacity-30 text-foreground uppercase tracking-widest">
                        {plan.period}
                      </span>
                    </div>

                    <ul className="space-y-4 mb-10 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-xs font-bold text-foreground/90">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${feature.startsWith('No ') ? 'bg-danger/10' : 'bg-primary/10'}`}>
                             <span className={`text-[8px] ${feature.startsWith('No ') ? 'text-danger' : 'text-primary'}`}>
                               {feature.startsWith('No ') ? '✕' : '✦'}
                             </span>
                          </div>
                          <span className={`leading-snug ${feature.startsWith('No ') ? 'opacity-40 line-through' : ''}`}>
                            {feature.replace('No ', '')}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      as={Link}
                      href="/register"
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'solid' : 'bordered'}
                      className={`w-full font-black h-14 text-sm uppercase tracking-[0.2em] shadow-lg ${
                        isSelected 
                          ? 'shadow-primary/30' 
                          : 'border-foreground/10 text-foreground hover:bg-foreground/5'
                      }`}
                      radius="full"
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
