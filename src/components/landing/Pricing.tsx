'use client';

import { Button, Card, CardBody, Chip, Switch } from '@heroui/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for local small shops',
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: 'forever',
    features: [
      '100 inventory items',
      '1 admin user',
      'Basic invoicing',
      'Community support',
    ],
    cta: 'Start Now',
    popular: false,
  },
  {
    name: 'Business',
    description: 'The standard for growth',
    monthlyPrice: 1499,
    yearlyPrice: 1199,
    period: '/month',
    features: [
      'Unlimited items',
      '10 staff users',
      'GST & Profit analysis',
      'Repair logistics',
      'WhatsApp automation',
      'Custom subdomain',
      'Priority support',
    ],
    cta: 'Try Business',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For chains & distributors',
    monthlyPrice: 4999,
    yearlyPrice: 3999,
    period: '/month',
    features: [
      'Multiple locations',
      'API access',
      'Unlimited users',
      'Custom contracts',
      'Dedicated manager',
      'Inventory forecasting',
    ],
    cta: 'Talk to Sales',
    popular: false,
  },
];

const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="section-padding bg-background relative overflow-hidden">
      <div className="container-custom relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
           <Chip variant="flat" color="secondary" className="mb-6 font-bold uppercase text-xs">
              Pricing Options
           </Chip>
           <h2 className="heading-lg mb-8">Invest in your <span className="text-secondary italic">Efficiency.</span></h2>
           
           <div className="flex items-center justify-center gap-4 mt-12 bg-foreground/5 p-3 rounded-full w-fit mx-auto border border-foreground/5">
              <span className={`text-sm font-bold ${!isYearly ? 'text-primary' : 'opacity-40'}`}>Monthly</span>
              <Switch
                isSelected={isYearly}
                onValueChange={setIsYearly}
                color="primary"
                size="sm"
              />
              <span className={`text-sm font-bold ${isYearly ? 'text-primary' : 'opacity-40'}`}>Yearly</span>
              {isYearly && <Chip size="sm" color="success" className="text-[10px] font-bold text-white ml-2">Save 20%</Chip>}
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-end max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={plan.popular ? 'z-10' : ''}
            >
              <Card 
                className={`modern-card p-4 h-fit ${
                  plan.popular 
                    ? 'border-primary ring-4 ring-primary/10 shadow-2xl lg:scale-110 bg-white dark:bg-dark-card' 
                    : 'opacity-80 hover:opacity-100 transition-opacity'
                }`}
                radius="lg"
              >
                <CardBody className="p-8">
                  {plan.popular && (
                    <Chip color="primary" size="sm" className="mb-6 font-bold uppercase text-[10px] tracking-widest">
                       Recommended
                    </Chip>
                  )}
                  <div className="mb-10">
                    <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                    <p className="text-xs font-medium opacity-40">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-2 mb-10">
                    <span className="text-5xl font-black">₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                    <span className="text-sm font-bold opacity-30">{plan.period}</span>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm font-medium opacity-70">
                        <span className="text-primary">✦</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    as={Link}
                    href="/register"
                    color={plan.popular ? 'primary' : 'default'}
                    variant={plan.popular ? 'solid' : 'bordered'}
                    className={`w-full font-black h-14 shadow-lg ${
                      plan.popular ? 'shadow-primary/30' : 'border-foreground/10'
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
