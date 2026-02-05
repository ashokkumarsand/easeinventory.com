'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, Mail, MessageCircle, Phone } from 'lucide-react';
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
    question: 'What about data privacy and security?',
    answer:
      'We use enterprise-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your data is your own - we do not share or sell business metrics to any third parties.',
  },
  {
    question: 'Do you offer training and onboarding?',
    answer:
      'Yes! All paid plans include free onboarding support. Enterprise customers get dedicated account managers and custom training sessions for their teams.',
  },
];

const FAQ: React.FC = () => {
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
      id="faq"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left: Header & Contact */}
          <div
            className={`lg:col-span-2 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="lg:sticky lg:top-32">
              <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground/80">
                  FAQ
                </span>
              </div>
              <h2
                id="faq-heading"
                className="text-3xl sm:text-4xl font-black leading-tight mb-6"
              >
                Frequently asked
                <span className="gradient-text block">questions</span>
              </h2>
              <p className="text-foreground/60 mb-8">
                Everything you need to know about EaseInventory. Can&apos;t find what
                you&apos;re looking for? Reach out to our support team.
              </p>

              {/* Contact Card */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <p className="text-sm font-medium text-foreground/50 uppercase tracking-wider">
                  Get in touch
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:help@easeinventory.com"
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Email Support</p>
                      <p className="text-xs text-foreground/50">
                        help@easeinventory.com
                      </p>
                    </div>
                  </a>
                  <a
                    href="tel:+919411436666"
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Phone className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Phone Support</p>
                      <p className="text-xs text-foreground/50">+91 94114 36666</p>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/919411436666"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">WhatsApp</p>
                      <p className="text-xs text-foreground/50">Quick responses</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Accordion */}
          <div
            className={`lg:col-span-3 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="glass-card px-6 rounded-2xl border-none overflow-hidden data-[state=open]:ring-1 data-[state=open]:ring-primary/20"
                >
                  <AccordionTrigger className="py-5 text-left font-semibold text-base text-foreground hover:text-primary hover:no-underline transition-colors [&[data-state=open]]:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-foreground/60 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
