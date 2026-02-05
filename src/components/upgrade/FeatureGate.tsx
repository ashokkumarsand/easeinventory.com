'use client';

import { Button } from '@/components/ui/button';
import { usePlan } from '@/contexts/PlanContext';
import { FeatureKey, PLAN_FEATURES, PLAN_DETAILS } from '@/lib/plan-features';
import { Lock, Sparkles } from 'lucide-react';
import React from 'react';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLockOverlay?: boolean;
}

/**
 * Wrapper component to gate features based on user's plan.
 * Shows upgrade prompt if feature is not available.
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showLockOverlay = true,
}: FeatureGateProps) {
  const { hasFeature, showUpgradeModal } = usePlan();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showLockOverlay) {
    return null;
  }

  const featureInfo = PLAN_FEATURES[feature];
  const minPlan = PLAN_DETAILS[featureInfo.minPlan];

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="pointer-events-none select-none blur-sm opacity-50">{children}</div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
        <div className="text-center p-6 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-2">{featureInfo.name}</h3>
          <p className="text-sm text-foreground/50 mb-4">{featureInfo.description}</p>
          <p className="text-xs text-foreground/40 mb-4">
            Available on <span className="font-bold text-primary">{minPlan.name}</span> plan
          </p>
          <Button
            className="font-bold"
            onClick={() => showUpgradeModal(feature)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FeatureGateInlineProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallbackMessage?: string;
}

/**
 * Inline version of FeatureGate that shows a simple message
 */
export function FeatureGateInline({
  feature,
  children,
  fallbackMessage,
}: FeatureGateInlineProps) {
  const { hasFeature, showUpgradeModal } = usePlan();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  const featureInfo = PLAN_FEATURES[feature];
  const minPlan = PLAN_DETAILS[featureInfo.minPlan];

  return (
    <button
      onClick={() => showUpgradeModal(feature)}
      className="flex items-center gap-2 text-sm text-foreground/50 hover:text-primary transition-colors"
    >
      <Lock className="w-4 h-4" />
      <span>
        {fallbackMessage || `${featureInfo.name} requires ${minPlan.name} plan`}
      </span>
    </button>
  );
}

interface FeatureGateButtonProps {
  feature: FeatureKey;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Button that checks feature access before executing onClick
 */
export function FeatureGateButton({
  feature,
  children,
  onClick,
  className,
  disabled,
}: FeatureGateButtonProps) {
  const { requireFeature, hasFeature } = usePlan();
  const isLocked = !hasFeature(feature);

  const handleClick = () => {
    if (requireFeature(feature)) {
      onClick?.();
    }
  };

  return (
    <Button
      className={className}
      onClick={handleClick}
      disabled={disabled}
      variant={isLocked ? 'outline' : 'default'}
    >
      {isLocked && <Lock className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}
