'use client';

import { usePlan } from '@/contexts/PlanContext';
import { PLAN_DETAILS, formatPrice } from '@/lib/plan-features';
import { Button } from '@heroui/react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface UpgradeBannerProps {
  variant?: 'default' | 'compact' | 'sidebar';
  dismissible?: boolean;
}

export function UpgradeBanner({ variant = 'default', dismissible = true }: UpgradeBannerProps) {
  const { plan, showUpgradeModal, recommendedPlan } = usePlan();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show for premium plans
  if (plan === 'BUSINESS' || plan === 'ENTERPRISE' || isDismissed) {
    return null;
  }

  const targetPlan = recommendedPlan || 'STARTER';
  const targetDetails = PLAN_DETAILS[targetPlan];

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            Upgrade to <span className="font-bold">{targetDetails.name}</span> for more features
          </span>
        </div>
        <Button
          size="sm"
          color="primary"
          variant="flat"
          className="font-bold"
          onClick={() => showUpgradeModal()}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Upgrade
          </span>
        </div>
        <p className="text-sm font-medium mb-3">
          Get {targetDetails.name} for {formatPrice(targetDetails.price)}/mo
        </p>
        <Button
          size="sm"
          color="primary"
          className="w-full font-bold"
          onClick={() => showUpgradeModal()}
        >
          View Plans
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 p-6">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">
              Unlock More with {targetDetails.name}
            </h3>
            <p className="text-sm text-foreground/60">
              {plan === 'FREE'
                ? 'Get WhatsApp notifications, bulk operations, and more.'
                : 'Unlock custom domains, advanced analytics, and multi-location support.'}
            </p>
            <p className="text-sm font-bold text-primary mt-2">
              Starting at {formatPrice(targetDetails.price)}/month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            color="primary"
            className="font-bold"
            endContent={<ArrowRight className="w-4 h-4" />}
            onClick={() => showUpgradeModal()}
          >
            Upgrade Now
          </Button>
          {dismissible && (
            <Button
              isIconOnly
              variant="light"
              size="sm"
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
  const { plan, showUpgradeModal } = usePlan();

  // Don't show for premium plans
  if (plan === 'BUSINESS' || plan === 'ENTERPRISE') {
    return null;
  }

  return (
    <Button
      size="sm"
      color="warning"
      variant="flat"
      className="font-bold"
      startContent={<Sparkles className="w-3.5 h-3.5" />}
      onClick={() => showUpgradeModal()}
    >
      Upgrade
    </Button>
  );
}
