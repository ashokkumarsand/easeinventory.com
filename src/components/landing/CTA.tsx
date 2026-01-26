'use client';

import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

const CTA: React.FC = () => {
  return (
    <section className="section-padding relative overflow-hidden !bg-background !text-foreground">
      {/* Background with Theme-aware Base and Primary Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50 dark:opacity-100" />
      
      {/* Precision Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="container-custom relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="heading-lg text-foreground mb-10 uppercase tracking-tighter">
            Ready to <span className="text-primary italic">Accelerate</span> <br />
            Your Enterprise?
          </h2>
          <p className="paragraph-lg text-foreground/60 mb-16 italic">
            Join 10,000+ modern businesses redefining retail in India. <br />
            No legacy systems. Just pure momentum.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12">
            <Button
              as={Link}
              href="/register"
              size="lg"
              className="bg-primary text-white font-black px-12 h-20 text-xl shadow-2xl hover:scale-105 transition-transform"
              radius="full"
            >
              Get Started Free
            </Button>
            <Button
              as={Link}
              href="/contact"
              variant="bordered"
              size="lg"
              className="border-foreground/10 text-foreground font-black px-12 h-20 text-xl hover:bg-foreground/5"
              radius="full"
            >
              Consult an Expert
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-foreground/30">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-widest">No keys required</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-primary rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-widest">Free forever plan</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
