/**
 * Plan-based feature gating configuration
 *
 * This module defines which features are available on each subscription plan.
 * Features are gated at both UI level (showing upgrade prompts) and API level.
 */

export type PlanType = 'FREE' | 'STARTER' | 'BUSINESS' | 'ENTERPRISE';

export type FeatureKey =
  | 'whatsapp_messages'
  | 'custom_domain'
  | 'api_access'
  | 'advanced_analytics'
  | 'multi_location'
  | 'bulk_operations'
  | 'export_reports'
  | 'custom_roles'
  | 'audit_trail'
  | 'priority_support'
  | 'white_label'
  | 'sso_integration'
  | 'carrier_integration'
  | 'orders_management'
  | 'procurement_management'
  | 'inventory_intelligence'
  | 'demand_analytics'
  | 'perishable_management'
  | 'reorder_suggestions'
  | 'shipping_analytics'
  | 'cycle_counting'
  | 'supplier_performance'
  | 'bom_management'
  | 'inventory_valuation'
  | 'supplier_payment_terms'
  | 'order_smoothing';

export interface PlanFeature {
  name: string;
  description: string;
  minPlan: PlanType;
}

export interface PlanDetails {
  name: string;
  price: number; // Monthly price in INR
  yearlyPrice: number; // Yearly price in INR (discounted)
  description: string;
  features: string[];
  limits: {
    products: number;
    users: number;
    locations: number;
    invoices: number; // per month
    storage: number; // in GB
  };
}

// Plan hierarchy for comparison (higher = more features)
export const PLAN_HIERARCHY: Record<PlanType, number> = {
  FREE: 0,
  STARTER: 1,
  BUSINESS: 2,
  ENTERPRISE: 3,
};

// Feature definitions with minimum required plan
export const PLAN_FEATURES: Record<FeatureKey, PlanFeature> = {
  whatsapp_messages: {
    name: 'WhatsApp Messages',
    description: 'Send automated WhatsApp notifications to customers',
    minPlan: 'STARTER',
  },
  custom_domain: {
    name: 'Custom Domain',
    description: 'Use your own domain for your inventory portal',
    minPlan: 'BUSINESS',
  },
  api_access: {
    name: 'API Access',
    description: 'Full REST API access for integrations',
    minPlan: 'ENTERPRISE',
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Detailed reports, trends, and business insights',
    minPlan: 'BUSINESS',
  },
  multi_location: {
    name: 'Multi-Location',
    description: 'Manage inventory across multiple warehouses',
    minPlan: 'BUSINESS',
  },
  bulk_operations: {
    name: 'Bulk Operations',
    description: 'Import/export and bulk edit inventory',
    minPlan: 'STARTER',
  },
  export_reports: {
    name: 'Export Reports',
    description: 'Download detailed PDF/CSV reports',
    minPlan: 'ENTERPRISE',
  },
  custom_roles: {
    name: 'Custom Roles',
    description: 'Create custom permission roles for your team',
    minPlan: 'BUSINESS',
  },
  audit_trail: {
    name: 'Audit Trail',
    description: 'Track all changes with detailed audit logs',
    minPlan: 'BUSINESS',
  },
  priority_support: {
    name: 'Priority Support',
    description: '24/7 priority customer support',
    minPlan: 'ENTERPRISE',
  },
  white_label: {
    name: 'White Label',
    description: 'Remove EaseInventory branding',
    minPlan: 'ENTERPRISE',
  },
  sso_integration: {
    name: 'SSO Integration',
    description: 'Single Sign-On with Google, Microsoft, etc.',
    minPlan: 'ENTERPRISE',
  },
  carrier_integration: {
    name: 'Carrier Integration',
    description: 'Ship via Shiprocket, Delhivery, and other carriers',
    minPlan: 'BUSINESS',
  },
  orders_management: {
    name: 'Orders Management',
    description: 'Sales order fulfillment with pick/pack workflow',
    minPlan: 'STARTER',
  },
  procurement_management: {
    name: 'Procurement',
    description: 'Purchase orders and goods receipt management',
    minPlan: 'STARTER',
  },
  inventory_intelligence: {
    name: 'Inventory Intelligence',
    description: 'ABC/XYZ classification, safety stock, reorder optimization',
    minPlan: 'BUSINESS',
  },
  demand_analytics: {
    name: 'Demand Analytics',
    description: 'Sales velocity tracking, moving averages, and demand forecasting',
    minPlan: 'BUSINESS',
  },
  perishable_management: {
    name: 'Perishable Management',
    description: 'FEFO picking, expiry alerts, and waste tracking',
    minPlan: 'STARTER',
  },
  reorder_suggestions: {
    name: 'Smart Reorder',
    description: 'Automated PO suggestions based on reorder points and lead times',
    minPlan: 'BUSINESS',
  },
  shipping_analytics: {
    name: 'Shipping Analytics',
    description: 'Delivery performance KPIs, carrier metrics, and COD reconciliation',
    minPlan: 'BUSINESS',
  },
  cycle_counting: {
    name: 'Cycle Counting',
    description: 'Physical inventory counting workflow with variance tracking',
    minPlan: 'STARTER',
  },
  supplier_performance: {
    name: 'Supplier Performance',
    description: 'Track lead times, quality, on-time delivery, and reliability scores',
    minPlan: 'BUSINESS',
  },
  bom_management: {
    name: 'BOM / Kit Management',
    description: 'Bill of materials, kit assembly, and disassembly workflows',
    minPlan: 'BUSINESS',
  },
  inventory_valuation: {
    name: 'Inventory Valuation',
    description: 'Valuation breakdowns, carrying cost analysis, and working capital metrics',
    minPlan: 'BUSINESS',
  },
  supplier_payment_terms: {
    name: 'Supplier Payment Terms',
    description: 'Payment tracking, payables aging, and trade credit visibility',
    minPlan: 'BUSINESS',
  },
  order_smoothing: {
    name: 'Order Smoothing',
    description: 'Bullwhip effect detection and EMA-smoothed order quantities',
    minPlan: 'BUSINESS',
  },
};

// Plan details for upgrade modal
export const PLAN_DETAILS: Record<PlanType, PlanDetails> = {
  FREE: {
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: 'For small businesses getting started',
    features: [
      'Up to 100 products',
      '1 user',
      '1 location',
      'Basic inventory tracking',
      'Simple invoicing',
      'Email support',
    ],
    limits: {
      products: 100,
      users: 1,
      locations: 1,
      invoices: 50,
      storage: 1,
    },
  },
  STARTER: {
    name: 'Starter',
    price: 999,
    yearlyPrice: 9990, // ~17% discount
    description: 'For growing businesses',
    features: [
      'Up to 500 products',
      '5 users',
      '1 location',
      'WhatsApp notifications',
      'Bulk import/export',
      'Basic reports',
      'Chat support',
    ],
    limits: {
      products: 500,
      users: 5,
      locations: 1,
      invoices: 200,
      storage: 5,
    },
  },
  BUSINESS: {
    name: 'Business',
    price: 2499,
    yearlyPrice: 24990, // ~17% discount
    description: 'For established businesses',
    features: [
      'Unlimited products',
      '20 users',
      '5 locations',
      'Custom domain',
      'Advanced analytics',
      'Multi-location inventory',
      'Custom roles',
      'Audit trail',
      'Priority chat support',
    ],
    limits: {
      products: -1, // unlimited
      users: 20,
      locations: 5,
      invoices: -1, // unlimited
      storage: 25,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 4999,
    yearlyPrice: 49990, // ~17% discount
    description: 'For large organizations',
    features: [
      'Everything in Business',
      'Unlimited users',
      'Unlimited locations',
      'API access',
      'Export reports',
      'White label',
      'SSO integration',
      '24/7 priority support',
      'Dedicated account manager',
    ],
    limits: {
      products: -1,
      users: -1,
      locations: -1,
      invoices: -1,
      storage: 100,
    },
  },
};

/**
 * Check if a plan has access to a feature
 */
export function hasFeatureAccess(userPlan: PlanType, feature: FeatureKey): boolean {
  const featureConfig = PLAN_FEATURES[feature];
  if (!featureConfig) return false;
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[featureConfig.minPlan];
}

/**
 * Get the minimum plan required for a feature
 */
export function getMinPlanForFeature(feature: FeatureKey): PlanType | null {
  return PLAN_FEATURES[feature]?.minPlan ?? null;
}

/**
 * Get all features available for a plan
 */
export function getFeaturesForPlan(plan: PlanType): FeatureKey[] {
  return (Object.keys(PLAN_FEATURES) as FeatureKey[]).filter((feature) =>
    hasFeatureAccess(plan, feature)
  );
}

/**
 * Get features that would be unlocked by upgrading to a plan
 */
export function getUnlockedFeatures(currentPlan: PlanType, targetPlan: PlanType): FeatureKey[] {
  const currentFeatures = getFeaturesForPlan(currentPlan);
  const targetFeatures = getFeaturesForPlan(targetPlan);
  return targetFeatures.filter((feature) => !currentFeatures.includes(feature));
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get the recommended upgrade plan from current plan
 */
export function getRecommendedUpgrade(currentPlan: PlanType): PlanType | null {
  const hierarchy: PlanType[] = ['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE'];
  const currentIndex = hierarchy.indexOf(currentPlan);
  if (currentIndex === -1 || currentIndex >= hierarchy.length - 1) return null;
  return hierarchy[currentIndex + 1];
}

/**
 * Sidebar menu items that should be gated by plan
 */
export const GATED_MENU_ITEMS: Record<string, FeatureKey> = {
  '/communications': 'whatsapp_messages',
  '/settings/domains': 'custom_domain',
  '/inventory/locations': 'multi_location',
  '/settings/roles': 'custom_roles',
  '/settings/audit': 'audit_trail',
  '/carriers': 'carrier_integration',
  '/intelligence': 'demand_analytics',
  '/shipments/analytics': 'shipping_analytics',
  '/cycle-counting': 'cycle_counting',
  '/suppliers/performance': 'supplier_performance',
  '/bom': 'bom_management',
  '/inventory-valuation': 'inventory_valuation',
  '/suppliers/payables': 'supplier_payment_terms',
};

/**
 * Analytics widgets and their required plans
 */
export const ANALYTICS_WIDGETS: Record<string, { minPlan: PlanType; name: string }> = {
  stats_overview: { minPlan: 'FREE', name: 'Stats Overview' },
  recent_activity: { minPlan: 'FREE', name: 'Recent Activity' },
  stock_levels: { minPlan: 'FREE', name: 'Stock Levels' },
  revenue_chart: { minPlan: 'STARTER', name: 'Revenue Trends' },
  low_stock_alerts: { minPlan: 'STARTER', name: 'Low Stock Alerts' },
  top_products: { minPlan: 'BUSINESS', name: 'Top Products' },
  sales_by_category: { minPlan: 'BUSINESS', name: 'Sales by Category' },
  inventory_turnover: { minPlan: 'BUSINESS', name: 'Inventory Turnover' },
  export_reports: { minPlan: 'ENTERPRISE', name: 'Export Reports' },
  demand_velocity: { minPlan: 'BUSINESS', name: 'Demand Velocity' },
  abc_xyz_matrix: { minPlan: 'BUSINESS', name: 'ABC/XYZ Matrix' },
  safety_stock: { minPlan: 'BUSINESS', name: 'Safety Stock' },
  reorder_suggestions: { minPlan: 'BUSINESS', name: 'Reorder Suggestions' },
  expiry_alerts: { minPlan: 'STARTER', name: 'Expiry Alerts' },
  dead_stock: { minPlan: 'BUSINESS', name: 'Dead Stock Detection' },
  order_smoothing: { minPlan: 'BUSINESS', name: 'Order Smoothing' },
};
