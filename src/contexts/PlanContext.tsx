'use client';

import {
  PlanType,
  FeatureKey,
  hasFeatureAccess,
  PLAN_FEATURES,
  getRecommendedUpgrade,
} from '@/lib/plan-features';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface PlanContextValue {
  plan: PlanType;
  planExpiresAt: Date | null;
  isLoading: boolean;
  hasFeature: (feature: FeatureKey) => boolean;
  requireFeature: (feature: FeatureKey) => boolean;
  showUpgradeModal: (feature?: FeatureKey) => void;
  hideUpgradeModal: () => void;
  isUpgradeModalOpen: boolean;
  currentFeature: FeatureKey | null;
  recommendedPlan: PlanType | null;
  isSuperAdmin: boolean;
  isEnterprise: boolean;
  shouldShowUpgrade: boolean;
  userRole: string | null;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureKey | null>(null);

  const user = session?.user as any;
  const plan: PlanType = user?.plan || 'FREE';
  const planExpiresAt = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const isLoading = status === 'loading';
  const userRole = user?.role || null;

  // Check if user is super admin or has enterprise plan
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isEnterprise = plan === 'ENTERPRISE';
  // Don't show upgrade UI for super admins or enterprise users
  const shouldShowUpgrade = !isSuperAdmin && !isEnterprise;

  const hasFeature = useCallback(
    (feature: FeatureKey): boolean => {
      return hasFeatureAccess(plan, feature);
    },
    [plan]
  );

  // Returns true if feature is available, shows upgrade modal and returns false if not
  const requireFeature = useCallback(
    (feature: FeatureKey): boolean => {
      if (hasFeatureAccess(plan, feature)) {
        return true;
      }
      setCurrentFeature(feature);
      setIsUpgradeModalOpen(true);
      return false;
    },
    [plan]
  );

  const showUpgradeModal = useCallback((feature?: FeatureKey) => {
    setCurrentFeature(feature || null);
    setIsUpgradeModalOpen(true);
  }, []);

  const hideUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setCurrentFeature(null);
  }, []);

  const recommendedPlan = useMemo(() => getRecommendedUpgrade(plan), [plan]);

  const value = useMemo(
    () => ({
      plan,
      planExpiresAt,
      isLoading,
      hasFeature,
      requireFeature,
      showUpgradeModal,
      hideUpgradeModal,
      isUpgradeModalOpen,
      currentFeature,
      recommendedPlan,
      isSuperAdmin,
      isEnterprise,
      shouldShowUpgrade,
      userRole,
    }),
    [
      plan,
      planExpiresAt,
      isLoading,
      hasFeature,
      requireFeature,
      showUpgradeModal,
      hideUpgradeModal,
      isUpgradeModalOpen,
      currentFeature,
      recommendedPlan,
      isSuperAdmin,
      isEnterprise,
      shouldShowUpgrade,
      userRole,
    ]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}
