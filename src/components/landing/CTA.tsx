'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

const CTA: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-[900px] mx-auto relative z-10">
        <div
          className={`relative rounded-3xl p-8 sm:p-12 lg:p-20 text-center overflow-hidden transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(132,204,22,0.05), rgba(34,211,238,0.05))',
            border: '1px solid var(--glass-border)',
          }}
        >
          {/* Headline */}
          <h2
            id="cta-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-[700px] mx-auto"
          >
            Ready to Accelerate Your
            <span className="gradient-text block">Enterprise?</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Join 10,000+ modern businesses redefining retail in India.
            No legacy systems. Just pure momentum.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="btn-glow font-semibold h-14 px-8 text-base rounded-xl w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Link href="/register" className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="font-semibold h-14 px-8 text-base rounded-xl border-foreground/10 hover:bg-foreground/5 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Link href="/contact">Consult an Expert</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
