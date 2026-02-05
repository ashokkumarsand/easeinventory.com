'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlan } from '@/contexts/PlanContext';
import {
  PlanType,
  PLAN_DETAILS,
  PLAN_FEATURES,
  PLAN_HIERARCHY,
  formatPrice,
  getUnlockedFeatures,
} from '@/lib/plan-features';
import { Check, Crown, Sparkles, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const PLAN_ICONS: Record<PlanType, React.ReactNode> = {
  FREE: <Star className="w-5 h-5" />,
  STARTER: <Zap className="w-5 h-5" />,
  BUSINESS: <Sparkles className="w-5 h-5" />,
  ENTERPRISE: <Crown className="w-5 h-5" />,
};

// Explicit color classes to prevent Tailwind purging
const PLAN_COLOR_CLASSES: Record<PlanType, { bg: string; text: string }> = {
  FREE: { bg: 'bg-zinc-500/10', text: 'text-zinc-500' },
  STARTER: { bg: 'bg-primary/10', text: 'text-primary' },
  BUSINESS: { bg: 'bg-secondary/10', text: 'text-secondary' },
  ENTERPRISE: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
};

export function UpgradeModal() {
  const { plan, isUpgradeModalOpen, hideUpgradeModal, currentFeature, recommendedPlan } = usePlan();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const featureInfo = currentFeature ? PLAN_FEATURES[currentFeature] : null;
  const plans: PlanType[] = ['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE'];

  const handleUpgrade = (targetPlan: PlanType) => {
    // In production, this would redirect to Razorpay checkout
    window.location.href = `/settings/billing?plan=${targetPlan}&cycle=${billingCycle}`;
    hideUpgradeModal();
  };

  return (
    <Dialog open={isUpgradeModalOpen} onOpenChange={(open) => !open && hideUpgradeModal()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto theme-modal rounded-2xl">
        <DialogHeader className="border-b border-foreground/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {featureInfo ? `Unlock ${featureInfo.name}` : 'Upgrade Your Plan'}
              </DialogTitle>
              <DialogDescription className="text-sm text-foreground/50 font-normal">
                {featureInfo
                  ? featureInfo.description
                  : 'Get more features and grow your business'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}>
              <TabsList className="bg-foreground/5 p-1">
                <TabsTrigger value="monthly" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="yearly" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <span className="flex items-center gap-2">
                    Yearly <span className="text-xs text-green-500">Save 17%</span>
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((planType) => {
              const details = PLAN_DETAILS[planType];
              const isCurrentPlan = plan === planType;
              const isUpgrade = PLAN_HIERARCHY[planType] > PLAN_HIERARCHY[plan];
              const isRecommended = planType === recommendedPlan;
              const price =
                billingCycle === 'yearly' ? details.yearlyPrice / 12 : details.price;
              const unlockedFeatures = isUpgrade ? getUnlockedFeatures(plan, planType) : [];

              return (
                <div
                  key={planType}
                  className={`relative rounded-2xl border p-5 transition-all ${
                    isRecommended
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : isCurrentPlan
                      ? 'border-foreground/20 bg-foreground/5'
                      : 'border-foreground/10 hover:border-foreground/20'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Recommended
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isCurrentPlan
                          ? 'bg-green-500/10 text-green-500'
                          : `${PLAN_COLOR_CLASSES[planType].bg} ${PLAN_COLOR_CLASSES[planType].text}`
                      }`}
                    >
                      {PLAN_ICONS[planType]}
                    </div>
                    <span className="font-bold">{details.name}</span>
                    {isCurrentPlan && (
                      <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-black">{formatPrice(price)}</span>
                    {price > 0 && <span className="text-foreground/40 text-sm">/month</span>}
                    {billingCycle === 'yearly' && price > 0 && (
                      <p className="text-xs text-foreground/40 mt-1">
                        Billed {formatPrice(details.yearlyPrice)} yearly
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-foreground/50 mb-4">{details.description}</p>

                  <ul className="space-y-2 mb-6">
                    {details.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-foreground/70">{feature}</span>
                      </li>
                    ))}
                    {details.features.length > 5 && (
                      <li className="text-xs text-foreground/40 pl-6">
                        +{details.features.length - 5} more features
                      </li>
                    )}
                  </ul>

                  <Button
                    variant={isRecommended ? 'default' : isCurrentPlan ? 'secondary' : isUpgrade ? 'default' : 'outline'}
                    className="w-full font-bold rounded-full"
                    disabled={isCurrentPlan || !isUpgrade}
                    onClick={() => handleUpgrade(planType)}
                  >
                    {isCurrentPlan
                      ? 'Current Plan'
                      : isUpgrade
                      ? `Upgrade to ${details.name}`
                      : 'Downgrade'}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison Note */}
          {currentFeature && featureInfo && (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm">
                <strong>{featureInfo.name}</strong> requires the{' '}
                <strong>{PLAN_DETAILS[featureInfo.minPlan].name}</strong> plan or higher.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-foreground/5 pt-4">
          <Button variant="secondary" className="rounded-full" onClick={hideUpgradeModal}>
            Maybe Later
          </Button>
          <Button
            variant="secondary"
            className="rounded-full"
            asChild
          >
            <Link href="/pricing" target="_blank">
              Compare All Features
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
