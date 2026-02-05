'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';

const plans = [
  {
    name: 'Free',
    description: 'For small businesses getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: 'forever',
    features: [
      'Up to 100 products',
      '1 user',
      '1 location',
      'Basic inventory tracking',
      'Simple invoicing',
      'Email support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Starter',
    description: 'For growing businesses',
    monthlyPrice: 999,
    yearlyPrice: 833, // ₹9,990/year = ₹833/month
    period: '/mo',
    features: [
      'Up to 500 products',
      '5 users',
      'WhatsApp notifications',
      'Bulk import/export',
      'Basic reports',
      'Chat support',
    ],
    cta: 'Start Growing',
    popular: false,
  },
  {
    name: 'Business',
    description: 'For established businesses',
    monthlyPrice: 2499,
    yearlyPrice: 2083, // ₹24,990/year = ₹2,083/month
    period: '/mo',
    features: [
      'Unlimited products',
      '20 users',
      '5 locations',
      'Custom domain',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Scale Up',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 4999,
    yearlyPrice: 4166, // ₹49,990/year = ₹4,166/month
    period: '/mo',
    features: [
      'Unlimited users',
      'Unlimited locations',
      'API access',
      'White label',
      'SSO integration',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('Business');

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
           
            <div className="flex flex-col items-center gap-6 mt-10 w-full mx-auto">
               <Tabs value={billingCycle} onValueChange={setBillingCycle} className="overflow-hidden">
                 <TabsList className="bg-muted p-1 gap-0 border border-border overflow-hidden rounded-full">
                   <TabsTrigger
                     value="monthly"
                     className="h-10 px-6 font-black text-[10px] md:text-xs tracking-widest uppercase data-[state=active]:bg-white dark:data-[state=active]:bg-primary data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-lg rounded-full"
                   >
                     Monthly
                   </TabsTrigger>
                   <TabsTrigger
                     value="yearly"
                     className="h-10 px-6 font-black text-[10px] md:text-xs tracking-widest uppercase data-[state=active]:bg-white dark:data-[state=active]:bg-primary data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-lg rounded-full"
                   >
                     <div className="flex items-center justify-center gap-2 w-full">
                        <span>Yearly</span>
                        <div className="relative flex items-center">
                          <div className="absolute inset-0 bg-green-500 blur-md opacity-40 animate-pulse rounded-full" />
                          <div className="relative bg-green-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black tracking-tighter shadow-lg whitespace-nowrap leading-none">
                            Save 17%
                          </div>
                        </div>
                     </div>
                   </TabsTrigger>
                 </TabsList>
               </Tabs>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-primary">
                  Billed annually
               </p>
            </div>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 max-w-[95rem] mx-auto pt-16 pb-12 -mx-6 px-6 md:mx-auto md:px-0">
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
                className={`relative flex flex-col overflow-visible shrink-0 snap-center w-[85vw] md:w-auto cursor-pointer ${isSelected ? 'z-30' : 'z-10'}`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                <Card
                  className={`modern-card flex-1 border shadow-lg transition-all duration-500 overflow-visible relative h-full rounded-xl ${
                    isSelected
                      ? '!bg-background border-primary shadow-2xl shadow-primary/20 translate-y-[-16px]'
                      : 'bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <CardContent className="p-8 flex flex-col h-full relative overflow-visible">
                    {isPopular && (
                      <div className="absolute -top-10 left-0 w-full flex justify-center z-50 pointer-events-none">
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
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${feature.startsWith('No ') ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                             <span className={`text-[8px] ${feature.startsWith('No ') ? 'text-destructive' : 'text-primary'}`}>
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
                      asChild
                      variant={isSelected ? 'default' : 'outline'}
                      className={`w-full font-black h-12 text-xs uppercase tracking-[0.2em] shadow-lg rounded-full ${
                        isSelected
                          ? 'shadow-primary/30'
                          : 'border-foreground/10 text-foreground hover:bg-foreground/5'
                      }`}
                      size="lg"
                    >
                      <Link href="/register">
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardContent>
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
