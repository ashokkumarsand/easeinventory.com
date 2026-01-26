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
    <section id="how-it-works" className="section-padding bg-background overflow-hidden relative">
      {/* Decorative lines for connection */}
      <div className="absolute top-[60%] left-0 w-full h-[2px] bg-foreground/[0.03] hidden lg:block -translate-y-1/2" />
      
      <div className="container-custom relative">
        <div className="text-center max-w-4xl mx-auto mb-24 lg:mb-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
             <div className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full w-fit">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary whitespace-nowrap leading-relaxed pt-0.5">Operational Protocol</span>
             </div>
             <h2 className="heading-lg">Streamlined <span className="text-secondary italic">Deployment.</span></h2>
             <p className="paragraph-lg italic max-w-2xl mx-auto">We removed the friction of legacy ERPs. EaseInventory is built for rapid mobilization and absolute control.</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
            >
              <Card className="modern-card group relative overflow-visible h-full bg-card hover:border-secondary/30" radius="lg">
                <CardBody className="p-12 lg:p-16 flex flex-col items-center text-center">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-background rounded-[32px] flex items-center justify-center border-[6px] border-background group-hover:scale-110 transition-all duration-700 z-20 shadow-none">
                     <div className="w-full h-full rounded-[26px] bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-xl shadow-secondary/10">
                        <span className="text-4xl">{step.icon}</span>
                     </div>
                  </div>
                  
                  <div className="mt-12 space-y-8">
                    <span className="text-8xl font-black text-foreground/[0.05] block leading-none tracking-tighter italic group-hover:text-secondary/10 transition-colors">{step.number}</span>
                    <h3 className="text-3xl font-black group-hover:text-secondary transition-colors text-foreground uppercase tracking-tight">{step.title}</h3>
                    <p className="text-lg font-medium opacity-60 leading-relaxed italic text-foreground">{step.description}</p>
                  </div>

                  <div className="mt-12 w-12 h-1.5 bg-secondary/20 rounded-full group-hover:w-full transition-all duration-1000" />
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
