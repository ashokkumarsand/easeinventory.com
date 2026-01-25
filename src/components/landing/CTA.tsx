'use client';

import { Button } from '@heroui/react';
import Link from 'next/link';
import React from 'react';

const CTA: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary" />
      
      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative Shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/80 mb-10 leading-relaxed">
            Join 10,000+ businesses already using EaseInventory. Start free today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              as={Link}
              href="/register"
              size="lg"
              radius="lg"
              className="bg-white text-primary font-semibold px-8 min-w-[200px] shadow-xl hover:bg-white/90"
            >
              Get Started Free
            </Button>
            <Button
              as={Link}
              href="/contact"
              variant="bordered"
              size="lg"
              radius="lg"
              className="border-white/40 text-white font-semibold px-8 min-w-[200px] hover:bg-white/10"
            >
              Talk to Sales
            </Button>
          </div>
          
          <p className="text-white/60 text-sm">
            No credit card required • Free forever plan available
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
