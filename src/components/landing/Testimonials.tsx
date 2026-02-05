'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, Star, Users } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const testimonials = [
  {
    rating: 5,
    text: "Switched from a legacy ERP and never looked back. The speed of EaseInventory is incredible for our busy retail counters.",
    author: 'Rajesh Kumar',
    role: 'Owner, Mobility Solutions',
    location: 'Pune',
    initials: 'RK',
    image: null,
  },
  {
    rating: 5,
    text: "Managing repair tickets used to be a nightmare. Now, customers get auto-updates and my technicians are 30% more productive.",
    author: 'Sunita Mehta',
    role: 'Founder, Alpha Fixit',
    location: 'Delhi',
    initials: 'SM',
    image: null,
  },
  {
    rating: 5,
    text: "The multi-tenant subdomain feature allowed me to set up 5 franchise locations in one day. Phenomenal scalability.",
    author: 'Arjun Singh',
    role: 'Director, Singla Electronics',
    location: 'Mumbai',
    initials: 'AS',
    image: null,
  },
];

const stats = [
  { value: '10,000+', label: 'Active Businesses' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '50L+', label: 'Products Managed' },
];

const Testimonials: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground/80">
              Customer Stories
            </span>
          </div>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6"
          >
            Loved by businesses
            <span className="gradient-text block">across India</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            See what our customers have to say about their experience with
            EaseInventory.
          </p>
        </div>

        {/* Stats */}
        <div
          className={`grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mb-16 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-foreground">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-foreground/50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={`glass-card p-6 rounded-2xl transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 2) * 100}ms` }}
            >
              {/* Quote icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-primary/30" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground/80 leading-relaxed mb-6">
                &quot;{testimonial.text}&quot;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-foreground/5">
                <Avatar className="w-10 h-10">
                  {testimonial.image && (
                    <AvatarImage src={testimonial.image} alt={testimonial.author} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {testimonial.role}, {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
