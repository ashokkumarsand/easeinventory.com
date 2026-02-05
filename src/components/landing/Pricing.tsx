'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Crown, Sparkles, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

// Plan order for comparison
const PLAN_ORDER = ['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE'] as const;
type PlanName = typeof PLAN_ORDER[number];

function getPlanIndex(planName: string): number {
  const normalized = planName.toUpperCase();
  return PLAN_ORDER.indexOf(normalized as PlanName);
}

const plans = [
  {
    name: 'Free',
    description: 'For small businesses getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: 'forever',
    features: [
      { text: 'Up to 100 products', included: true },
      { text: '1 user', included: true },
      { text: '1 location', included: true },
      { text: 'Basic inventory tracking', included: true },
      { text: 'Simple invoicing', included: true },
      { text: 'Email support', included: true },
      { text: 'WhatsApp notifications', included: false },
      { text: 'Custom domain', included: false },
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Starter',
    description: 'For growing businesses',
    monthlyPrice: 999,
    yearlyPrice: 799,
    period: '/mo',
    features: [
      { text: 'Up to 500 products', included: true },
      { text: '5 users', included: true },
      { text: '2 locations', included: true },
      { text: 'WhatsApp notifications', included: true },
      { text: 'Bulk import/export', included: true },
      { text: 'Basic reports', included: true },
      { text: 'Chat support', included: true },
      { text: 'Custom domain', included: false },
    ],
    cta: 'Start Growing',
    popular: false,
  },
  {
    name: 'Business',
    description: 'For established businesses',
    monthlyPrice: 2499,
    yearlyPrice: 1999,
    period: '/mo',
    features: [
      { text: 'Unlimited products', included: true },
      { text: '20 users', included: true },
      { text: '5 locations', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true },
      { text: 'White label', included: false },
    ],
    cta: 'Scale Up',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 4999,
    yearlyPrice: 3999,
    period: '/mo',
    features: [
      { text: 'Unlimited users', included: true },
      { text: 'Unlimited locations', included: true },
      { text: 'Full API access', included: true },
      { text: 'White label', included: true },
      { text: 'SSO integration', included: true },
      { text: 'Dedicated manager', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SLA guarantee', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { data: session, status } = useSession();

  const user = session?.user as any;
  const userPlan = user?.plan || 'FREE';
  const userRole = user?.role;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isEnterprise = userPlan === 'ENTERPRISE';
  const isAuthenticated = status === 'authenticated';

  // Get user's current plan index for comparison
  const userPlanIndex = getPlanIndex(userPlan);

  // Helper to get CTA text and variant based on plan comparison
  const getPlanCTA = (planName: string) => {
    if (isSuperAdmin) {
      return { text: 'Full Access', variant: 'secondary' as const, disabled: true };
    }

    const planIndex = getPlanIndex(planName);

    if (!isAuthenticated) {
      return { text: planName === 'Free' ? 'Get Started Free' : `Start with ${planName}`, variant: 'default' as const, disabled: false };
    }

    if (planIndex === userPlanIndex) {
      return { text: 'Current Plan', variant: 'secondary' as const, disabled: true };
    }

    if (planIndex > userPlanIndex) {
      return { text: 'Upgrade', variant: 'default' as const, disabled: false };
    }

    return { text: 'Switch Plan', variant: 'outline' as const, disabled: false };
  };

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
      id="pricing"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="pricing-heading"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-[-20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground/80">
              Simple Pricing
            </span>
          </div>
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6"
          >
            Choose your
            <span className="gradient-text block">growth plan</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
            Start free and scale as you grow. All plans include core features with no
            hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-foreground/5 border border-foreground/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold shadow-sm">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/30">
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={`pricing-card h-full flex flex-col ${
                  plan.popular ? 'pricing-card-recommended' : ''
                }`}
              >
                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-foreground/50">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-foreground">
                      {plan.monthlyPrice === 0
                        ? 'Free'
                        : `₹${billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}`}
                    </span>
                    {plan.monthlyPrice !== 0 && (
                      <span className="text-sm text-foreground/50">{plan.period}</span>
                    )}
                  </div>
                  {plan.monthlyPrice !== 0 && billingCycle === 'yearly' && (
                    <p className="text-xs text-foreground/40 mt-1">
                      Billed annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.text}
                      className={`flex items-start gap-3 text-sm ${
                        feature.included
                          ? 'text-foreground/80'
                          : 'text-foreground/30'
                      }`}
                    >
                      {feature.included ? (
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-foreground/20 mt-0.5 shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {(() => {
                  const ctaInfo = getPlanCTA(plan.name);
                  const isCurrentPlan = ctaInfo.text === 'Current Plan';
                  const planIndex = getPlanIndex(plan.name);
                  const isUserPlan = planIndex === userPlanIndex && isAuthenticated;

                  return (
                    <>
                      {isUserPlan && (
                        <div className="flex items-center justify-center gap-2 mb-3 text-primary">
                          <Crown className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Your Plan</span>
                        </div>
                      )}
                      <Button
                        asChild={!ctaInfo.disabled}
                        variant={isCurrentPlan ? 'secondary' : (plan.popular ? 'default' : ctaInfo.variant)}
                        disabled={ctaInfo.disabled}
                        className={`w-full font-semibold h-12 rounded-xl ${
                          plan.popular && !isCurrentPlan
                            ? 'btn-glow'
                            : isCurrentPlan
                            ? 'bg-primary/10 text-primary cursor-default'
                            : 'border-foreground/10 hover:bg-foreground/5'
                        }`}
                      >
                        {ctaInfo.disabled ? (
                          <span className="flex items-center justify-center gap-2">
                            {ctaInfo.text}
                          </span>
                        ) : (
                          <Link href="/register" className="flex items-center justify-center gap-2">
                            {ctaInfo.text}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </Button>
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p
          className={`text-center text-sm text-foreground/50 mt-12 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          All prices in INR. GST extra where applicable. Need a custom plan?{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Pricing;
