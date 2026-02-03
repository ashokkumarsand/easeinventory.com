'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const screenshots = [
  {
    title: 'Dashboard Overview',
    description: 'Real-time metrics and analytics at a glance',
    image: '/screenshots/dashboard.png',
    fallbackGradient: 'from-primary/20 to-secondary/20',
  },
  {
    title: 'Inventory Management',
    description: 'Track every product with serial number precision',
    image: '/screenshots/inventory.png',
    fallbackGradient: 'from-secondary/20 to-warning/20',
  },
  {
    title: 'GST Invoicing',
    description: 'Generate compliant invoices in seconds',
    image: '/screenshots/invoice.png',
    fallbackGradient: 'from-warning/20 to-success/20',
  },
  {
    title: 'Repair Tracking',
    description: 'Professional job cards and status updates',
    image: '/screenshots/repairs.png',
    fallbackGradient: 'from-success/20 to-primary/20',
  },
  {
    title: 'Mobile Experience',
    description: 'Full functionality on any device',
    image: '/screenshots/mobile.png',
    fallbackGradient: 'from-primary/20 to-danger/20',
  },
];

const BetaGallery: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <section className="py-20 md:py-32 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">
            Sneak Peek
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Beta <span className="text-primary italic">Snapshots</span>
          </h2>
          <p className="text-lg md:text-xl font-bold text-white/40 max-w-2xl mx-auto italic">
            Get an exclusive look at what&apos;s coming. Clean, powerful, and built for speed.
          </p>
        </motion.div>

        {/* Gallery Carousel */}
        <div className="relative">
          {/* Main Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-[16/10] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.02]"
          >
            {imageErrors[currentIndex] ? (
              // Fallback gradient when image doesn't exist
              <div className={`absolute inset-0 bg-gradient-to-br ${screenshots[currentIndex].fallbackGradient} flex items-center justify-center`}>
                <div className="text-center space-y-4 p-8">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 flex items-center justify-center">
                    <Maximize2 size={32} className="text-white/40" />
                  </div>
                  <p className="text-xl font-black uppercase text-white/60">
                    {screenshots[currentIndex].title}
                  </p>
                  <p className="text-sm font-bold text-white/30 italic">
                    Screenshot coming soon
                  </p>
                </div>
              </div>
            ) : (
              <Image
                src={screenshots[currentIndex].image}
                alt={screenshots[currentIndex].title}
                fill
                className="object-cover"
                onError={() => handleImageError(currentIndex)}
              />
            )}

            {/* Overlay with title */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10">
              <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-2">
                {screenshots[currentIndex].title}
              </h3>
              <p className="text-sm md:text-base font-bold text-white/60 italic">
                {screenshots[currentIndex].description}
              </p>
            </div>
          </motion.div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-all duration-300"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-all duration-300"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="flex justify-center gap-3 mt-6 md:mt-8">
          {screenshots.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BetaGallery;
