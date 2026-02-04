import { usePlan } from '@/contexts/PlanContext';
import {
  PlanType,
  FeatureKey,
  PLAN_FEATURES,
  PLAN_DETAILS,
  GATED_MENU_ITEMS,
  ANALYTICS_WIDGETS,
  PLAN_HIERARCHY,
  hasFeatureAccess,
  getUnlockedFeatures,
  formatPrice,
} from '@/lib/plan-features';

export { usePlan };

/**
 * Hook for checking feature access with convenience methods
 */
export function usePlanFeatures() {
  const {
    plan,
    planExpiresAt,
    isLoading,
    hasFeature,
    requireFeature,
    showUpgradeModal,
    recommendedPlan,
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
    return PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[widget.minPlan];
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
   * Check if user should see upgrade prompts (FREE or STARTER)
   */
  const shouldShowUpgradePrompts = (): boolean => {
    return plan === 'FREE' || plan === 'STARTER';
  };

  /**
   * Check if user is on free plan
   */
  const isFreePlan = (): boolean => plan === 'FREE';

  /**
   * Check if user has premium plan (BUSINESS or ENTERPRISE)
   */
  const isPremiumPlan = (): boolean => {
    return plan === 'BUSINESS' || plan === 'ENTERPRISE';
  };

  return {
    // Core plan info
    plan,
    planExpiresAt,
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

    // Re-exports
    PLAN_FEATURES,
    PLAN_DETAILS,
    ANALYTICS_WIDGETS,
    formatPrice,
  };
}
