'use client';

import { Button } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const bannerSlides = [
  {
    title: 'Smart Inventory',
    highlight: 'Management',
    subtitle: 'Simplified for Growth',
    description: 'Track stock, manage pricing, and automate alerts. The most advanced inventory system for Indian shops and companies.',
    icon: '📦',
    color: 'from-primary/20 to-transparent',
  },
  {
    title: 'Repair & Service',
    highlight: 'Automation',
    subtitle: 'Customer Joy, Realtime',
    description: 'WhatsApp alerts, technician assignment, and status tracking. Professionalize your service center in minutes.',
    icon: '🔧',
    color: 'from-secondary/20 to-transparent',
  },
  {
    title: 'HST/GST Ready',
    highlight: 'Invoicing',
    subtitle: 'Compliance Made Easy',
    description: 'Generate professional invoices, manage payments, and stay tax compliant with one powerful dashboard.',
    icon: '📄',
    color: 'from-orange-500/10 to-transparent',
  },
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] pt-40 pb-24 lg:pt-56 lg:pb-40 flex flex-col justify-center overflow-hidden bg-background">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-drift pointer-events-none" />
      <div className="absolute bottom-[0%] left-[-10%] w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[180px] animate-drift delay-1000 pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-12 gap-20 lg:gap-24 items-center">
          
          {/* Left: Content */}
          <div className="lg:col-span-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-4 bg-foreground/5 border border-foreground/10 px-6 py-3 rounded-full mb-12 shadow-sm">
                 <span className="text-2xl">🇮🇳</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/60 leading-none">Proudly Engineered in India</span>
              </div>
            </motion.div>

            <div className="relative min-h-[480px] md:min-h-[520px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-10 leading-[0.85] tracking-tighter text-foreground uppercase">
                    {bannerSlides[currentSlide].title}{' '}
                    <span className="text-primary italic">
                      {bannerSlides[currentSlide].highlight}
                    </span>
                    <br />
                    <span className="text-foreground/30 text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter">
                      {bannerSlides[currentSlide].subtitle}
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl lg:text-3xl text-foreground/60 max-w-4xl mx-auto leading-relaxed mb-14 font-medium italic">
                    {bannerSlides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* CTA's */}
            <div className="flex flex-col sm:flex-row items-center gap-8 justify-center mt-12">
              <Button
                as={Link}
                href="/register"
                color="primary"
                size="lg"
                className="font-black px-16 h-24 text-2xl shadow-2xl shadow-primary/40 uppercase tracking-widest"
                radius="full"
              >
                Inaugurate Trial
              </Button>
              <Button
                as={Link}
                href="#demo"
                variant="bordered"
                size="lg"
                className="font-black px-16 h-24 text-2xl border-foreground/10 text-foreground uppercase tracking-widest hover:bg-foreground/5"
                radius="full"
              >
                Request Access
              </Button>
            </div>

            {/* Dots */}
            <div className="flex gap-6 mt-20 justify-center">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 transition-all duration-700 rounded-full ${
                    index === currentSlide ? 'w-24 bg-primary' : 'w-6 bg-foreground/10 hover:bg-foreground/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
