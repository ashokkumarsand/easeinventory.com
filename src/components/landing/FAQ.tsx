'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Mail, Phone } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const faqs = [
  {
    question: 'Where is my data stored?',
    answer:
      'We prioritize data residency. All business data is stored in AWS Mumbai and Azure Central India regions, ensuring highest speeds and compliance with Indian regulations.',
  },
  {
    question: 'How do I manage multiple branches?',
    answer:
      'Our Business and Enterprise plans allow you to add multiple locations. You can track stock transfers, view centralized analytics, and manage branch-specific staff roles from one admin panel.',
  },
  {
    question: 'Is there a limit on transactions?',
    answer:
      'None at all. Whether you generate 10 or 10,000 invoices a day, our infrastructure scales automatically to handle your business volume without any extra charges.',
  },
  {
    question: 'Can I use a custom domain?',
    answer:
      'Yes! While every business gets a free yourshop.easeinventory.com subdomain, you can easily map your own domain (e.g., portal.yourbrand.com) in the settings on Business plan and above.',
  },
  {
    question: 'What about data privacy?',
    answer:
      'We use enterprise-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your data is your own — we do not share or sell business metrics to any third parties.',
  },
];

const FAQ: React.FC = () => {
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
      id="faq"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="faq-heading"
    >
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-12 lg:mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Intelligence Hub
            </span>
          </div>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-[800px] mx-auto"
          >
            Got Questions?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about scaling operations with EaseInventory.
          </p>
        </div>

        {/* Accordion — Full Width */}
        <div
          className={`max-w-3xl mx-auto transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="feature-card !p-0 overflow-hidden border-none data-[state=open]:ring-1 data-[state=open]:ring-primary/20"
              >
                <AccordionTrigger className="px-6 py-5 text-left font-semibold text-base text-foreground hover:text-primary hover:no-underline transition-colors [&[data-state=open]]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Still stuck? */}
          <div className="text-center mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Still stuck?</span>
            <a
              href="mailto:help@easeinventory.com"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <Mail className="w-4 h-4" />
              help@easeinventory.com
            </a>
            <span className="text-foreground/20">|</span>
            <a
              href="tel:+919411436666"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <Phone className="w-4 h-4" />
              +91 94114 36666
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
