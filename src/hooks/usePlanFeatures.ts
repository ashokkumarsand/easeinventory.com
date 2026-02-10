import { usePlan } from '@/contexts/PlanContext';
import {
  PlanType,
  FeatureKey,
  PLAN_FEATURES,
  PLAN_DETAILS,
  GATED_MENU_ITEMS,
  ANALYTICS_WIDGETS,
  PLAN_HIERARCHY,
  ADD_ON_PRICES,
  hasFeatureAccess,
  getUnlockedFeatures,
  formatPrice,
  normalizePlanType,
} from '@/lib/plan-features';

export { usePlan };

/**
 * Hook for checking feature access with convenience methods
 */
export function usePlanFeatures() {
  const {
    plan,
    planExpiresAt,
    trialEndsAt,
    isLoading,
    hasFeature,
    requireFeature,
    showUpgradeModal,
    recommendedPlan,
    isTrialPlan,
    trialDaysRemaining,
    isTrialExpired,
    canBuyAddOns,
  } = usePlan();

  /**
   * Check if a menu item should be locked based on the user's plan
   */
  const isMenuItemLocked = (href: string): boolean => {
    const requiredFeature = GATED_MENU_ITEMS[href];
    if (!requiredFeature) return false;
    return !hasFeature(requiredFeature);
  };

  /**
   * Get the feature key for a locked menu item
   */
  const getMenuItemFeature = (href: string): FeatureKey | null => {
    return GATED_MENU_ITEMS[href] || null;
  };

  /**
   * Check if an analytics widget is available
   */
  const isAnalyticsWidgetAvailable = (widgetKey: string): boolean => {
    const widget = ANALYTICS_WIDGETS[widgetKey];
    if (!widget) return true;
    return hasFeatureAccess(plan, widgetKey as FeatureKey) ||
      PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[widget.minPlan];
  };

  /**
   * Get the minimum plan required for an analytics widget
   */
  const getWidgetMinPlan = (widgetKey: string): PlanType | null => {
    return ANALYTICS_WIDGETS[widgetKey]?.minPlan || null;
  };

  /**
   * Get feature details
   */
  const getFeatureDetails = (feature: FeatureKey) => {
    return PLAN_FEATURES[feature];
  };

  /**
   * Get current plan details
   */
  const getPlanDetails = () => {
    return PLAN_DETAILS[plan];
  };

  /**
   * Get features that would be unlocked by upgrading
   */
  const getUpgradeUnlocks = (targetPlan?: PlanType) => {
    const target = targetPlan || recommendedPlan;
    if (!target) return [];
    return getUnlockedFeatures(plan, target);
  };

  /**
   * Check if plan is expired
   */
  const isPlanExpired = (): boolean => {
    if (!planExpiresAt) return false;
    return new Date() > planExpiresAt;
  };

  /**
   * Get days until plan expires
   */
  const getDaysUntilExpiry = (): number | null => {
    if (!planExpiresAt) return null;
    const now = new Date();
    const diff = planExpiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  /**
   * Check if user should see upgrade prompts (TRIAL or BASIC)
   */
  const shouldShowUpgradePrompts = (): boolean => {
    return plan === 'TRIAL' || plan === 'BASIC';
  };

  /**
   * Check if user is on free/trial plan
   */
  const isFreePlan = (): boolean => isTrialPlan;

  /**
   * Check if user has premium plan (BUSINESS or ENTERPRISE)
   */
  const isPremiumPlan = (): boolean => {
    return plan === 'BUSINESS' || plan === 'ENTERPRISE';
  };

  /**
   * Get available add-on options for the current plan
   */
  const getAvailableAddOns = () => {
    if (!canBuyAddOns) return [];
    return ADD_ON_PRICES.filter((a) => a.availableOn.includes(plan));
  };

  /**
   * Get the limit status string for a resource
   */
  const getLimitStatus = (current: number, limit: number): 'ok' | 'warning' | 'critical' | 'unlimited' => {
    if (limit === -1) return 'unlimited';
    const pct = (current / limit) * 100;
    if (pct >= 100) return 'critical';
    if (pct >= 80) return 'warning';
    return 'ok';
  };

  return {
    // Core plan info
    plan,
    planExpiresAt,
    trialEndsAt,
    isLoading,
    recommendedPlan,

    // Feature checks
    hasFeature,
    requireFeature,
    showUpgradeModal,

    // Menu gating
    isMenuItemLocked,
    getMenuItemFeature,

    // Analytics gating
    isAnalyticsWidgetAvailable,
    getWidgetMinPlan,

    // Details
    getFeatureDetails,
    getPlanDetails,
    getUpgradeUnlocks,

    // Status checks
    isPlanExpired,
    getDaysUntilExpiry,
    shouldShowUpgradePrompts,
    isFreePlan,
    isPremiumPlan,

    // Trial & add-ons
    isTrialPlan,
    trialDaysRemaining,
    isTrialExpired,
    canBuyAddOns,
    getAvailableAddOns,
    getLimitStatus,

    // Re-exports
    PLAN_FEATURES,
    PLAN_DETAILS,
    ANALYTICS_WIDGETS,
    ADD_ON_PRICES,
    formatPrice,
  };
}
