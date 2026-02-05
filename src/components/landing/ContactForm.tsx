'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const contactMethods = [
  {
    icon: Mail,
    label: 'Sales Inquiry',
    value: 'sales@easeinventory.com',
    href: 'mailto:sales@easeinventory.com',
    description: 'For pricing and demos',
  },
  {
    icon: Phone,
    label: 'General Support',
    value: '+91 94114 36666',
    href: 'tel:+919411436666',
    description: 'Mon-Sat, 9am-6pm IST',
  },
  {
    icon: MessageSquare,
    label: 'WhatsApp',
    value: 'Chat with us',
    href: 'https://wa.me/919411436666',
    description: 'Quick responses',
  },
];

const ContactForm: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Submission failed');
      setIsSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="contact-heading"
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
              Get Integrated
            </span>
          </div>
          <h2
            id="contact-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-[800px] mx-auto"
          >
            Ready to
            <span className="gradient-text block">Transform?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you have a specific question or want a custom walkthrough,
            our specialists are ready to help you scale.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Left: Contact Methods */}
          <div
            className={`lg:col-span-2 space-y-4 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <a
                  key={method.label}
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="feature-card !p-5 flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">{method.label}</p>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {method.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                </a>
              );
            })}

            {/* Office Card */}
            <div className="feature-card !p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <p className="font-bold text-foreground">India Headquarters</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                EaseInventory Technologies Pvt. Ltd.
                <br />
                GH2, Mahalunge, Pune 411045
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div
            className={`lg:col-span-3 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="feature-card !p-6 sm:!p-8">
              {isSent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    We&apos;ll get back to you within 2 hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSent(false)}
                    className="border-foreground/10"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground/70">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 glass-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground/70">
                        Work Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 glass-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground/70">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="h-12 glass-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground/70">
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your business needs..."
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="glass-input resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-glow font-semibold h-12 rounded-xl uppercase tracking-wider text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Process Inquiry
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Response time: under 2 hours during business hours
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
