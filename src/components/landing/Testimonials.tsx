'use client';

import { Avatar, Card, CardBody, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import React from 'react';

const testimonials = [
  {
    rating: 5,
    text: "Switched from a legacy ERP and never looked back. The speed of EaseInventory is just incredible for our busy retail counters.",
    author: 'Rajesh K.',
    role: 'Mobility Solutions, Pune',
    initials: 'RK',
  },
  {
    rating: 5,
    text: "Managing repair tickets used to be a nightmare. Now, customers get auto-updates and my technicians are 30% more productive.",
    author: 'Sunita M.',
    role: 'Alpha Fixit, Delhi',
    initials: 'SM',
  },
  {
    rating: 5,
    text: "The multi-tenant subdomain feature allowed me to set up 5 franchise locations in one day. Phenomenal scalability.",
    author: 'Arjun Singh',
    role: 'Singla Electronics Chain',
    initials: 'AS',
  },
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="section-padding bg-background/50 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Chip variant="flat" color="primary" className="mb-6 font-bold uppercase text-[10px] tracking-widest px-4">
             Success Chronicles
          </Chip>
          <h2 className="heading-lg mb-8 text-foreground">Voices of <span className="text-primary italic">Market Leaders.</span></h2>
        </div>

        <div className="layout-grid">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <Card className="modern-card p-6" radius="lg">
                <CardBody className="p-8">
                  <div className="flex gap-1 mb-8">
                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-yellow-500 text-xl font-bold">★</span>)}
                  </div>
                  
                  <p className="text-lg font-medium leading-[1.6] mb-10 opacity-70 italic">&quot;{t.text}&quot;</p>
                  
                  <div className="flex items-center gap-5 pt-8 border-t border-foreground/5">
                    <Avatar 
                       name={t.initials}
                       className="w-14 h-14 bg-primary text-white font-black text-lg shadow-lg shadow-primary/20"
                    />
                    <div>
                      <h4 className="font-black text-lg leading-none mb-1">{t.author}</h4>
                      <p className="text-xs font-bold opacity-40 uppercase tracking-widest">{t.role}</p>
                    </div>
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

export default Testimonials;
