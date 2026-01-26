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
           <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-8 w-fit">
              <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap leading-relaxed pt-0.5">The Momentum Engine</span>
           </div>
           <h2 className="heading-lg mb-8">
             Select Your <span className="text-primary italic">Growth Trajectory.</span>
           </h2>
           
            <div className="flex flex-col items-center gap-6 mt-10 w-full max-w-md mx-auto">
               <Tabs 
                 aria-label="Billing Cycle" 
                 color="primary" 
                 variant="solid"
                 radius="full"
                 size="lg"
                 fullWidth
                 selectedKey={billingCycle}
                 onSelectionChange={(key) => setBillingCycle(key.toString())}
                 classNames={{
                   base: "overflow-hidden",
                   tabList: "bg-default-100 p-1 gap-0 border border-default-200 overflow-hidden",
                   cursor: "shadow-lg bg-white dark:bg-primary shadow-primary/20",
                   tab: "h-12",
                   tabContent: "font-black text-xs md:text-sm group-data-[selected=true]:text-primary dark:group-data-[selected=true]:text-white tracking-widest uppercase flex items-center justify-center h-full w-full"
                 }}
               >
                 <Tab key="monthly" title="Monthly" />
                 <Tab 
                   key="yearly" 
                   title={
                     <div className="flex items-center justify-center gap-2 w-full">
                        <span>Yearly</span>
                        <div className="relative flex items-center">
                          <div className="absolute inset-0 bg-success blur-md opacity-40 animate-pulse rounded-full" />
                          <div className="relative bg-success text-white text-[8px] px-2 py-0.5 rounded-full font-black tracking-tighter shadow-lg whitespace-nowrap leading-none">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[95rem] mx-auto">
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
                className={`relative flex flex-col ${isSelected ? 'z-20' : 'z-0'}`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                <Card 
                  className={`modern-card flex-1 border shadow-lg transition-all duration-500 overflow-visible relative h-full ${
                    isSelected
                      ? 'bg-card border-primary shadow-2xl shadow-primary/20 translate-y-[-16px] z-30' 
                      : 'bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
                  }`}
                  radius="lg"
                  isPressable
                  onPress={() => setSelectedPlan(plan.name)}
                >
                  <CardBody className="p-8 flex flex-col h-full relative">
                    {isPopular && (
                      <div className="absolute -top-9 left-0 w-full flex justify-center z-50 pointer-events-none">
                        <div className="bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-lg shadow-primary/40 border border-white/20 whitespace-nowrap">
                          Recommended
                        </div>
                      </div>
                    )}

                    <div className="mb-6 text-center sm:text-left mt-4">
                      <h3 className={`text-lg font-black mb-2 uppercase tracking-tighter ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-xs font-bold opacity-60 leading-relaxed italic h-10 ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
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

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className={`flex items-start gap-3 text-xs font-bold ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}>
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
                      className={`w-full font-black h-12 text-xs uppercase tracking-[0.2em] shadow-lg ${
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
