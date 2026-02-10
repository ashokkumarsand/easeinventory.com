'use client';

import { Button } from '@/components/ui/button';
import { usePlan } from '@/contexts/PlanContext';
import { PLAN_DETAILS, formatPrice } from '@/lib/plan-features';
import { ArrowRight, Clock, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface UpgradeBannerProps {
  variant?: 'default' | 'compact' | 'sidebar';
  dismissible?: boolean;
}

export function UpgradeBanner({ variant = 'default', dismissible = true }: UpgradeBannerProps) {
  const {
    plan,
    showUpgradeModal,
    recommendedPlan,
    shouldShowUpgrade,
    isTrialPlan,
    trialDaysRemaining,
    isTrialExpired,
  } = usePlan();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show for super admins, enterprise users, or if dismissed
  if (!shouldShowUpgrade || isDismissed) {
    return null;
  }

  const targetPlan = recommendedPlan || 'BASIC';
  const targetDetails = PLAN_DETAILS[targetPlan];

  // Trial-specific messaging
  const trialMessage = isTrialExpired
    ? 'Your free trial has ended. Subscribe to continue using EaseInventory.'
    : isTrialPlan && trialDaysRemaining !== null
      ? `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} left in your free trial`
      : null;

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="flex items-center gap-2">
          {isTrialPlan ? (
            <Clock className="w-4 h-4 text-primary" />
          ) : (
            <Sparkles className="w-4 h-4 text-primary" />
          )}
          <span className="text-sm font-medium">
            {trialMessage || (
              <>
                Upgrade to <span className="font-bold">{targetDetails.name}</span> for more features
              </>
            )}
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="font-bold"
          onClick={() => showUpgradeModal()}
        >
          {isTrialPlan ? 'Subscribe' : 'Upgrade'}
        </Button>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          {isTrialPlan ? (
            <Clock className="w-4 h-4 text-primary" />
          ) : (
            <Sparkles className="w-4 h-4 text-primary" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {isTrialPlan ? (isTrialExpired ? 'Trial Ended' : 'Free Trial') : 'Upgrade'}
          </span>
        </div>
        {trialMessage ? (
          <p className="text-sm font-medium mb-3">{trialMessage}</p>
        ) : (
          <p className="text-sm font-medium mb-3">
            Get {targetDetails.name} for {formatPrice(targetDetails.price)}/mo
          </p>
        )}
        <Button
          size="sm"
          className="w-full font-bold"
          onClick={() => showUpgradeModal()}
        >
          {isTrialPlan ? 'View Plans' : 'View Plans'}
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 ${
      isTrialExpired
        ? 'bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10 border-destructive/20'
        : 'bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20'
    }`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isTrialExpired ? 'bg-destructive/20' : 'bg-primary/20'
          }`}>
            {isTrialPlan ? (
              <Clock className={`w-6 h-6 ${isTrialExpired ? 'text-destructive' : 'text-primary'}`} />
            ) : (
              <Sparkles className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">
              {isTrialExpired
                ? 'Your Free Trial Has Ended'
                : isTrialPlan
                  ? `${trialDaysRemaining} Days Left in Your Trial`
                  : `Unlock More with ${targetDetails.name}`}
            </h3>
            <p className="text-sm text-foreground/60">
              {isTrialExpired
                ? 'Subscribe to Basic (₹599/mo) or Business (₹3,999/mo) to continue.'
                : isTrialPlan
                  ? 'Subscribe before your trial ends to keep all your data and features.'
                  : plan === 'BASIC'
                    ? 'Unlock multi-location, custom roles, automation, and more.'
                    : 'Get advanced analytics, custom domains, and multi-location support.'}
            </p>
            {!isTrialPlan && (
              <p className="text-sm font-bold text-primary mt-2">
                Starting at {formatPrice(targetDetails.price)}/month
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="font-bold"
            variant={isTrialExpired ? 'destructive' : 'default'}
            onClick={() => showUpgradeModal()}
          >
            {isTrialPlan ? 'Subscribe Now' : 'Upgrade Now'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {dismissible && !isTrialExpired && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDismissed(true)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Small upgrade CTA button for navbar
 */
export function UpgradeCTA() {
  const { showUpgradeModal, shouldShowUpgrade, isTrialPlan, trialDaysRemaining, isTrialExpired } = usePlan();

  // Don't show for super admins or enterprise users
  if (!shouldShowUpgrade) {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      className={`font-bold ${
        isTrialExpired
          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
          : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
      }`}
      onClick={() => showUpgradeModal()}
    >
      {isTrialPlan ? (
        <>
          <Clock className="w-3.5 h-3.5 mr-2" />
          {isTrialExpired ? 'Trial Ended' : `${trialDaysRemaining}d Trial`}
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5 mr-2" />
          Upgrade
        </>
      )}
    </Button>
  );
}
