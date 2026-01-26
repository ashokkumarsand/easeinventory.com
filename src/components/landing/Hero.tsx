'use client';

import { Logo } from '@/components/icons/Logo';
import { Button, Card, CardBody } from '@heroui/react';
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
    <section className="relative min-h-[90vh] pt-32 pb-20 lg:pt-40 lg:pb-32 flex flex-col justify-center overflow-hidden bg-background">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-drift pointer-events-none" />
      <div className="absolute bottom-[0%] left-[-10%] w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[180px] animate-drift delay-1000 pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="inline-flex items-center gap-3 bg-foreground/5 border border-foreground/10 px-5 py-2 rounded-full mb-8 shadow-sm">
                 <span className="text-xl">🇮🇳</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 leading-none">Made for India</span>
              </div>
            </motion.div>

            <div className="relative min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full"
                >
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.95] tracking-tighter text-foreground uppercase">
                    {bannerSlides[currentSlide].title}{' '}
                    <span className="text-primary italic block md:inline">
                      {bannerSlides[currentSlide].highlight}
                    </span>
                    <br />
                    <span className="text-foreground/30 text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mt-2 block">
                      {bannerSlides[currentSlide].subtitle}
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10 font-medium italic">
                    {bannerSlides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* CTA's */}
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start mt-8">
              <Button
                as={Link}
                href="/register"
                color="primary"
                size="lg"
                className="font-black px-12 h-20 text-xl shadow-2xl shadow-primary/40 uppercase tracking-widest min-w-[200px]"
                radius="full"
              >
                Start Trial
              </Button>
              <Button
                as={Link}
                href="#demo"
                variant="bordered"
                size="lg"
                className="font-black px-12 h-20 text-xl border-foreground/10 text-foreground uppercase tracking-widest hover:bg-foreground/5 min-w-[200px]"
                radius="full"
              >
                View Demo
              </Button>
            </div>

            {/* Dots */}
            <div className="flex gap-4 mt-16 justify-center lg:justify-start">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 transition-all duration-700 rounded-full ${
                    index === currentSlide ? 'w-16 bg-primary' : 'w-4 bg-foreground/10 hover:bg-foreground/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="lg:col-span-5 relative group mt-12 lg:mt-0 perspective-1000">
            <motion.div
              initial={{ rotateY: -5, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="transform-gpu"
            >
              <div className="relative rounded-[40px] p-2 bg-gradient-to-br from-primary/30 to-secondary/30 shadow-2xl overflow-visible">
                <div className="bg-white dark:bg-[#0A0A0A] rounded-[34px] p-6 shadow-inner border border-white/10 dark:border-white/5 overflow-hidden min-h-[400px]">
                  
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                         <Logo size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold opacity-80 text-foreground">yourshop.ease</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 text-foreground font-black">Connected</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>

                   {/* Stat Grid */}
                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <Card className="modern-card bg-primary/5 border-none shadow-none" radius="lg">
                         <CardBody className="p-4">
                            <p className="text-[10px] font-black opacity-40 uppercase mb-2 text-foreground tracking-widest">Products</p>
                            <p className="text-2xl font-black text-foreground">2,482</p>
                            <div className="h-1 w-10 bg-primary mt-3 rounded-full" />
                         </CardBody>
                      </Card>
                      <Card className="modern-card bg-secondary/5 border-none shadow-none" radius="lg">
                        <CardBody className="p-4">
                           <p className="text-[10px] font-black opacity-40 uppercase mb-2 text-foreground tracking-widest">Stock Value</p>
                           <p className="text-2xl font-black text-foreground">₹14.2L</p>
                           <div className="h-1 w-10 bg-secondary mt-3 rounded-full" />
                        </CardBody>
                     </Card>
                  </div>

                  {/* List Item Mockup */}
                  <div className="space-y-4">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/[0.08] transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-lg shadow-sm">
                             {i === 1 ? '📦' : i === 2 ? '🔧' : '📱'}
                          </div>
                          <div className="flex-1">
                             <div className="h-2 w-24 bg-foreground/10 rounded-full mb-2" />
                             <div className="h-1.5 w-16 bg-foreground/5 rounded-full" />
                          </div>
                          <div className={`h-6 w-12 rounded-full opacity-20 ${i === 1 ? 'bg-primary' : 'bg-secondary'}`} />
                       </div>
                     ))}
                  </div>

                  {/* Floating Notification */}
                  <div className="absolute bottom-6 right-6 z-20">
                     <motion.div 
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       transition={{ delay: 1, duration: 0.5 }}
                       className="bg-foreground text-background p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10"
                     >
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">📈</div>
                        <div>
                           <p className="text-[10px] uppercase font-black opacity-60 tracking-widest">Revenue</p>
                           <p className="text-lg font-black">+42%</p>
                        </div>
                     </motion.div>
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
