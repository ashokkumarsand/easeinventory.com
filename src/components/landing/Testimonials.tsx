'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const testimonials = [
  {
    rating: 5,
    text: 'Switched from a legacy ERP and never looked back. The speed of EaseInventory is incredible for our busy retail counters.',
    author: 'Rajesh Kumar',
    role: 'Owner, Mobility Solutions',
    location: 'Pune',
    initials: 'RK',
    image: null,
  },
  {
    rating: 5,
    text: 'Managing repair tickets used to be a nightmare. Now, customers get auto-updates and my technicians are 30% more productive.',
    author: 'Sunita Mehta',
    role: 'Founder, Alpha Fixit',
    location: 'Delhi',
    initials: 'SM',
    image: null,
  },
  {
    rating: 5,
    text: 'The multi-tenant subdomain feature allowed me to set up 5 franchise locations in one day. Phenomenal scalability.',
    author: 'Arjun Singh',
    role: 'Director, Singla Electronics',
    location: 'Mumbai',
    initials: 'AS',
    image: null,
  },
];

const Testimonials: React.FC = () => {
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
      id="testimonials"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Success Chronicles
            </span>
          </div>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-[800px] mx-auto"
          >
            Voices of
            <span className="gradient-text block">Market Leaders.</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.author}
              className={`feature-card relative transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Decorative quote mark */}
              <span
                className="absolute top-6 left-8 text-6xl font-serif text-primary/10 leading-none select-none pointer-events-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>

              {/* Rating */}
              <div className="flex gap-1 mb-5 relative" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-300 text-amber-300" aria-hidden="true" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground/80 leading-relaxed mb-6 italic relative">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-foreground/5">
                <Avatar className="w-10 h-10">
                  {testimonial.image && (
                    <AvatarImage src={testimonial.image} alt={testimonial.author} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm text-foreground">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}, {testimonial.location}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
