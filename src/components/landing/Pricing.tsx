'use client';

import { Button } from '@/components/ui/button';
import { ADD_ON_PRICES, PlanType, normalizePlanType } from '@/lib/plan-features';
import { ArrowRight, Check, Crown, Zap, Sparkles, Building2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

const PLAN_ORDER: PlanType[] = ['BASIC', 'BUSINESS', 'ENTERPRISE'];

function getPlanIndex(planName: string): number {
  const normalized = normalizePlanType(planName);
  return PLAN_ORDER.indexOf(normalized);
}

const plans = [
  {
    key: 'BASIC' as PlanType,
    name: 'Basic',
    icon: <Zap className="w-5 h-5" />,
    description: 'Core operations for small shops',
    monthlyPrice: 599,
    yearlyPrice: 499,
    period: '/mo',
    trialCta: true,
    features: [
      { text: '500 products / 5 users', included: true },
      { text: '1 location', included: true },
      { text: '200 invoices/mo', included: true },
      { text: '2 GB storage', included: true },
      { text: 'Orders & procurement', included: true },
      { text: 'Carrier integration', included: true },
      { text: 'Demand analytics', included: true },
      { text: 'Smart reorder & dynamic pricing', included: true },
      { text: 'BOM / kit management', included: true },
      { text: 'Report builder', included: true },
    ],
    cta: 'Start 14-Day Free Trial',
    popular: false,
  },
  {
    key: 'BUSINESS' as PlanType,
    name: 'Business',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Multi-location growth features',
    monthlyPrice: 3999,
    yearlyPrice: 3332,
    period: '/mo',
    trialCta: false,
    features: [
      { text: '5,000 products / 15 users', included: true },
      { text: '5 locations', included: true },
      { text: 'Unlimited invoices', included: true },
      { text: '25 GB storage', included: true },
      { text: 'Everything in Basic', included: true },
      { text: 'Multi-location inventory', included: true },
      { text: 'Custom roles & domain', included: true },
      { text: 'Inventory intelligence', included: true },
      { text: 'Workflow automation', included: true },
      { text: 'Add-on credits for extra capacity', included: true },
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    key: 'ENTERPRISE' as PlanType,
    name: 'Enterprise',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Compliance, traceability, white-label',
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: '',
    trialCta: false,
    features: [
      { text: 'Unlimited everything', included: true },
      { text: '100 GB storage', included: true },
      { text: 'Everything in Business', included: true },
      { text: 'API access & webhooks', included: true },
      { text: 'White label & SSO', included: true },
      { text: 'Multi-echelon optimization', included: true },
      { text: 'Lot genealogy & traceability', included: true },
      { text: 'Fleet management', included: true },
      { text: 'SLA management', included: true },
      { text: 'Priority 24/7 support', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const { data: session, status } = useSession();

  const user = session?.user as any;
  const userPlan = normalizePlanType(user?.plan || 'TRIAL');
  const userRole = user?.role;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAuthenticated = status === 'authenticated';
  const userPlanIndex = getPlanIndex(userPlan);

  const getPlanCTA = (planKey: PlanType, defaultCta: string) => {
    if (isSuperAdmin) {
      return { text: 'Full Access', variant: 'secondary' as const, disabled: true };
    }
    const planIndex = getPlanIndex(planKey);
    if (!isAuthenticated) {
      return { text: defaultCta, variant: 'default' as const, disabled: false };
    }
    if (planKey === userPlan) {
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
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="pricing-heading"
    >
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Simple, Transparent Pricing
            </span>
          </div>
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-[800px] mx-auto"
          >
            Select Your
            <span className="gradient-text block">Growth Trajectory.</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Billing Toggle */}
          <div
            className="inline-flex items-center gap-1 p-1 rounded-full bg-foreground/5 border border-foreground/10"
            role="radiogroup"
            aria-label="Billing cycle"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              role="radio"
              aria-checked={billingCycle === 'monthly'}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              role="radio"
              aria-checked={billingCycle === 'yearly'}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                SAVE 17%
              </span>
            </button>
          </div>

          {billingCycle === 'yearly' && (
            <p className="text-xs text-muted-foreground mt-3 uppercase tracking-wider">
              Billed annually
            </p>
          )}
        </div>

        {/* Pricing Cards — 3 columns */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 lg:px-4 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const ctaInfo = getPlanCTA(plan.key, plan.cta);
            const isCurrentPlan = ctaInfo.text === 'Current Plan';
            const isUserPlan = plan.key === userPlan && isAuthenticated;
            const isEnterprise = plan.key === 'ENTERPRISE';

            return (
              <div
                key={plan.key}
                className={`relative transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Recommended badge */}
                {plan.popular && (
                  <div className="absolute translate-y-[-100%] left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/30 uppercase tracking-wider">
                      Recommended
                    </span>
                  </div>
                )}

                <div
                  className={`h-full flex flex-col p-8 rounded-2xl transition-all duration-300 ${
                    plan.popular
                      ? 'pricing-card-recommended lg:scale-105'
                      : 'feature-card'
                  }`}
                >
                  {/* Plan header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        plan.popular ? 'bg-primary/20 text-primary' : 'bg-foreground/10 text-foreground/60'
                      }`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {isEnterprise ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-foreground">Custom</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-foreground">
                            ₹{billingCycle === 'yearly'
                              ? plan.yearlyPrice.toLocaleString('en-IN')
                              : plan.monthlyPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm text-muted-foreground">{plan.period}</span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ₹{(plan.yearlyPrice * 12).toLocaleString('en-IN')} billed yearly
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.text}
                        className="flex items-start gap-3 text-sm text-foreground/80"
                      >
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isUserPlan && (
                    <div className="flex items-center justify-center gap-2 mb-3 text-primary">
                      <Crown className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Your Plan</span>
                    </div>
                  )}
                  <Button
                    asChild={!ctaInfo.disabled}
                    variant={isCurrentPlan ? 'secondary' : plan.popular ? 'default' : ctaInfo.variant}
                    disabled={ctaInfo.disabled}
                    className={`w-full font-semibold h-12 rounded-xl ${
                      plan.popular && !isCurrentPlan
                        ? 'btn-glow'
                        : isCurrentPlan
                          ? 'bg-primary/10 text-primary cursor-default'
                          : ''
                    }`}
                  >
                    {ctaInfo.disabled ? (
                      <span className="flex items-center justify-center gap-2">{ctaInfo.text}</span>
                    ) : isEnterprise ? (
                      <Link href="/contact" className="flex items-center justify-center gap-2">
                        {ctaInfo.text}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <Link href="/register" className="flex items-center justify-center gap-2">
                        {ctaInfo.text}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add-on Credits Section */}
        <div
          className={`mt-16 max-w-4xl mx-auto transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold mb-2">Need More? Add Credits</h3>
            <p className="text-sm text-muted-foreground">
              Business plan users can purchase add-on credits for extra capacity
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ADD_ON_PRICES.map((addOn) => (
              <div
                key={addOn.type}
                className="feature-card p-5 rounded-xl text-center"
              >
                <p className="text-sm font-bold mb-1">{addOn.name}</p>
                <p className="text-2xl font-black text-primary">₹{addOn.pricePerUnit}</p>
                <p className="text-xs text-muted-foreground mt-1">{addOn.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Feature Links */}
        <div
          className={`mt-12 text-center transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-sm text-muted-foreground mb-3">
            Explore all platform capabilities:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Warehouse & Orders', href: '/features/warehouse' },
              { name: 'Supply Chain', href: '/features/supply-chain' },
              { name: 'Intelligence', href: '/features/intelligence' },
              { name: 'Automation', href: '/features/automation' },
              { name: 'Multi-Location', href: '/features/multi-location' },
              { name: 'Enterprise Suite', href: '/features/enterprise' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-primary hover:underline px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 hover:border-primary/20 transition-colors"
              >
                {link.name} →
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p
          className={`text-center text-sm text-muted-foreground mt-12 transition-all duration-700 delay-500 ${
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
