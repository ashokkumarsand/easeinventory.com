'use client';

import { Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Claim your domain',
    description: 'Get your unique .easeinventory.com link and set up your business profile in seconds.',
    icon: '🌐',
  },
  {
    number: '02',
    title: 'Onboard inventory',
    description: 'Import products via Excel or add them manually with high-def photos and serial numbers.',
    icon: '📦',
  },
  {
    number: '03',
    title: 'Go Live',
    description: 'Start selling, tracking repairs, and generating GST-ready bills for your customers.',
    icon: '🚀',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="section-padding bg-background overflow-hidden">
      <div className="container-custom relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-foreground/5 -translate-y-1/2 hidden lg:block" />

        <div className="text-center max-w-3xl mx-auto mb-20 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
             <h2 className="heading-lg mb-6">Simple <span className="text-secondary italic">Onboarding</span></h2>
             <p className="paragraph-lg">We removed the complexity of ERPs. EaseInventory is as easy to use as a spreadsheet but way more powerful.</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="modern-card group relative overflow-visible h-full" radius="lg">
                <CardBody className="p-10 flex flex-col items-center text-center">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-background rounded-full flex items-center justify-center border-4 border-primary z-20">
                     <span className="text-3xl">{step.icon}</span>
                  </div>
                  
                  <div className="mt-8">
                    <span className="text-7xl font-black text-foreground/10 mb-6 block leading-none tracking-tighter italic">{step.number}</span>
                    <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors text-foreground">{step.title}</h3>
                    <p className="text-foreground/70 leading-relaxed font-medium">{step.description}</p>
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

export default HowItWorks;
