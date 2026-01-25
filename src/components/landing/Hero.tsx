'use client';

import { Logo } from '@/components/icons/Logo';
import { Button, Card, CardBody, Chip } from '@heroui/react';
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
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-drift" />
      <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] animate-drift delay-1000" />
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Chip
                variant="flat"
                size="lg"
                className="bg-primary/10 border border-primary/20 px-5 mb-8 text-primary font-bold tracking-wide uppercase text-xs"
                startContent={<span className="text-xl">🇮🇳</span>}
              >
                Proudly Built in India
              </Chip>
            </motion.div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
                    {bannerSlides[currentSlide].title}{' '}
                    <span className="text-primary italic">
                      {bannerSlides[currentSlide].highlight}
                    </span>
                    <br />
                    <span className="text-foreground/80 text-2xl md:text-4xl lg:text-5xl font-light">
                      {bannerSlides[currentSlide].subtitle}
                    </span>
                  </h1>
                  <p className="text-base md:text-lg text-foreground/60 max-w-2xl leading-relaxed mb-8">
                    {bannerSlides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* CTA's */}
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start mt-10">
              <Button
                as={Link}
                href="/register"
                color="primary"
                size="lg"
                className="font-bold px-10 h-16 text-lg shadow-2xl shadow-primary/30"
                radius="full"
              >
                Start Free Trial
              </Button>
              <Button
                as={Link}
                href="#demo"
                variant="bordered"
                size="lg"
                className="font-bold px-10 h-16 text-lg border-foreground/10 hover:bg-foreground/5"
                radius="full"
              >
                Book a Demo
              </Button>
            </div>

            {/* Dots */}
            <div className="flex gap-4 mt-16 justify-center lg:justify-start">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${
                    index === currentSlide ? 'w-12 bg-primary' : 'w-4 bg-foreground/10 hover:bg-foreground/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right: Modern Dashboard Mockup */}
          <div className="lg:col-span-5 relative group">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="relative rounded-[40px] p-2 bg-gradient-to-br from-primary/30 to-secondary/30 shadow-2xl overflow-hidden">
                <div className="bg-background rounded-[34px] p-6 shadow-inner border border-white/10 overflow-hidden">
                  
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                         <Logo size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold opacity-80">yourshop.ease</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-40">Connected</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-8 h-8 rounded-full bg-foreground/5 animate-pulse" />
                       <div className="w-8 h-8 rounded-full bg-foreground/5 animate-pulse" />
                    </div>
                  </div>

                   {/* Stat Grid */}
                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <Card className="modern-card bg-primary/5 border-none shadow-none" radius="lg">
                         <CardBody className="p-4">
                            <p className="text-xs font-medium opacity-50 uppercase mb-1">Products</p>
                            <p className="text-2xl font-black">2,482</p>
                            <div className="h-1 w-10 bg-primary mt-2 rounded-full" />
                         </CardBody>
                      </Card>
                      <Card className="modern-card bg-secondary/5 border-none shadow-none" radius="lg">
                        <CardBody className="p-4">
                           <p className="text-xs font-medium opacity-50 uppercase mb-1">Stock Value</p>
                           <p className="text-2xl font-black">₹14.2L</p>
                           <div className="h-1 w-10 bg-secondary mt-2 rounded-full" />
                        </CardBody>
                     </Card>
                  </div>

                  {/* List Item Mockup */}
                  <div className="space-y-4">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/[0.08] transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-lg">
                             {i === 1 ? '📦' : i === 2 ? '🔧' : '📱'}
                          </div>
                          <div className="flex-1">
                             <div className="h-2 w-24 bg-foreground/10 rounded mb-2" />
                             <div className="h-1.5 w-16 bg-foreground/5 rounded" />
                          </div>
                          <div className="h-6 w-12 bg-primary/10 rounded-full" />
                       </div>
                     ))}
                  </div>

                  {/* Overlays for depth */}
                  <div className="absolute bottom-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                     <div className="bg-primary text-white p-4 rounded-3xl shadow-xl flex items-center gap-4">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">📈</div>
                        <div>
                           <p className="text-[10px] uppercase font-bold opacity-60">Revenue</p>
                           <p className="text-lg font-black">+42%</p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
