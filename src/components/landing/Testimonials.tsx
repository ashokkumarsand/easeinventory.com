'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import React from 'react';

const testimonials = [
  {
    rating: 5,
    text: (
      <>
        Switched from a legacy ERP and never looked back. The speed of <span className='italic'>Ease</span><span className='text-primary italic'>Inventory</span> is just incredible for our busy retail counters.
      </>
    ),
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
    <section id="testimonials" className="section-padding bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-6"
          >
             <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full w-fit">
                <span className="text-xl">🏆</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap leading-relaxed pt-0.5">Success Chronicles</span>
             </div>
             <h2 className="heading-lg">Voices of <span className="text-primary italic">Market Leaders.</span></h2>
          </motion.div>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 gap-8 -mx-6 px-6 md:mx-auto md:px-0 pb-8 md:pb-0">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="shrink-0 snap-center w-[85vw] md:w-auto h-full"
            >
              <Card className="modern-card p-4 h-full bg-card hover:border-primary/30 rounded-lg">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex gap-1 mb-10">
                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-primary text-xl font-black">★</span>)}
                  </div>

                  <blockquote className="text-lg font-medium leading-relaxed mb-12 opacity-80 italic flex-1">
                    &quot;{t.text}&quot;
                  </blockquote>

                  <div className="flex items-center gap-5 pt-8 border-t border-foreground/5 mt-auto">
                    <Avatar className="w-14 h-14 bg-foreground/10">
                       <AvatarFallback className="text-foreground font-black text-lg">{t.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-black text-lg leading-none mb-2 text-foreground uppercase tracking-tight">{t.author}</h4>
                      <p className="text-[10px] font-black opacity-40 uppercase tracking-widest text-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
