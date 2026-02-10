'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Heart, MapPin, Rocket, Users } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const openings = [
  {
    title: 'Full-Stack Engineer',
    type: 'Full-time',
    location: 'Pune / Remote',
    description:
      'Build features across our Next.js + Prisma stack. Experience with React, TypeScript, and PostgreSQL required.',
  },
  {
    title: 'Product Designer',
    type: 'Full-time',
    location: 'Pune / Remote',
    description:
      'Design intuitive interfaces for inventory management. Proficiency in Figma and design systems expected.',
  },
  {
    title: 'Sales Development Representative',
    type: 'Full-time',
    location: 'Pune',
    description:
      'Help Indian retailers discover EaseInventory. Experience in SaaS sales and fluency in Hindi preferred.',
  },
];

const perks = [
  { icon: Rocket, title: 'High Impact', description: 'Ship features used by thousands of Indian businesses daily.' },
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health insurance for you and your family.' },
  { icon: Users, title: 'Great Team', description: 'Work alongside passionate engineers and designers.' },
  { icon: MapPin, title: 'Flexible Work', description: 'Hybrid office in Pune with remote-friendly policies.' },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
            style={{ background: 'radial-gradient(ellipse at center, rgba(132,204,22,0.08) 0%, transparent 70%)' }}
          />
          <div className="dot-grid absolute inset-0" />
        </div>

        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">Careers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-6">
            Join Our <span className="gradient-text italic">Team.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            Help us build the operating system for India&apos;s retail revolution.
            We&apos;re looking for passionate people who want to make a difference.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-center mb-12">Why EaseInventory?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.title} className="feature-card text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{perk.title}</h3>
                  <p className="text-sm text-muted-foreground">{perk.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-12">Open Positions</h2>
          <div className="space-y-6">
            {openings.map((job) => (
              <div key={job.title} className="feature-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="text-lg font-bold">{job.title}</h3>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="px-2.5 py-1 rounded-full bg-foreground/5 border border-foreground/10">
                      {job.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-foreground/5 border border-foreground/10">
                      {job.location}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{job.description}</p>
              </div>
            ))}
          </div>

          {/* Apply CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              Don&apos;t see your role? We&apos;re always looking for talented people.
            </p>
            <Button asChild size="lg" className="btn-glow font-semibold h-14 px-8 text-base rounded-xl">
              <a href="mailto:careers@easeinventory.com" className="flex items-center gap-2">
                Send Your Resume
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
