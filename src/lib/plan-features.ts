/**
 * Plan-based feature gating configuration
 *
 * 3-plan model: BASIC (₹599), BUSINESS (₹3,999), ENTERPRISE (Contact Sales)
 * + 14-day free trial of BASIC features for new users
 * + Credit-based add-ons for Business plan
 *
 * Backward compatibility: FREE → TRIAL, STARTER → BASIC
 */

export type PlanType = 'TRIAL' | 'BASIC' | 'BUSINESS' | 'ENTERPRISE';

/** @deprecated Use PlanType directly. Maps old plan names for backward compat. */
export type LegacyPlanType = 'FREE' | 'STARTER';

export type AddOnType = 'EXTRA_USERS' | 'EXTRA_SKUS' | 'EXTRA_LOCATIONS' | 'EXTRA_STORAGE';

export type FeatureKey =
  // BASIC plan (22 features)
  | 'orders_management'
  | 'procurement_management'
  | 'carrier_integration'
  | 'customer_management'
  | 'whatsapp_messages'
  | 'bulk_operations'
  | 'perishable_management'
  | 'cycle_counting'
  | 'activity_feed'
  | 'audit_trail'
  | 'shipping_analytics'
  | 'demand_analytics'
  | 'advanced_analytics'
  | 'reorder_suggestions'
  | 'inventory_valuation'
  | 'lost_sales'
  | 'decision_nudges'
  | 'dynamic_pricing'
  | 'supplier_performance'
  | 'bom_management'
  | 'supplier_payment_terms'
  | 'report_builder'
  // BUSINESS plan (+11 features = 33 total)
  | 'multi_location'
  | 'custom_roles'
  | 'custom_domain'
  | 'inventory_intelligence'
  | 'order_smoothing'
  | 'warehouse_capacity'
  | 'lateral_transshipment'
  | 'placement_optimizer'
  | 'workflow_automation'
  | 'demand_forecasting'
  | 'assortment_planning'
  // ENTERPRISE plan (+12 features = 45 total)
  | 'api_access'
  | 'export_reports'
  | 'white_label'
  | 'sso_integration'
  | 'priority_support'
  | 'outgoing_webhooks'
  | 'multi_echelon'
  | 'lot_genealogy'
  | 'sla_management'
  | 'fleet_management'
  | 'remanufacturing'
  | 'supplier_portal';

export interface PlanFeature {
  name: string;
  description: string;
  minPlan: PlanType;
}

export interface PlanDetails {
  name: string;
  price: number; // Monthly price in INR
  yearlyPrice: number; // Yearly price in INR (total)
  description: string;
  features: string[];
  limits: {
    products: number; // -1 = unlimited
    users: number; // -1 = unlimited (excludes admin)
    locations: number;
    invoices: number; // per month, -1 = unlimited
    storage: number; // in GB
  };
}

export interface AddOnPrice {
  type: AddOnType;
  name: string;
  description: string;
  pricePerUnit: number; // INR per month
  unit: string;
  availableOn: PlanType[];
}

// Plan hierarchy for comparison (higher = more features)
export const PLAN_HIERARCHY: Record<PlanType, number> = {
  TRIAL: 0,
  BASIC: 1,
  BUSINESS: 2,
  ENTERPRISE: 3,
};

/**
 * Map legacy plan names to new plan names.
 * Used in JWT callbacks and backward-compat paths.
 */
export function normalizePlanType(plan: string): PlanType {
  const legacyMap: Record<string, PlanType> = {
    FREE: 'TRIAL',
    STARTER: 'BASIC',
  };
  return (legacyMap[plan] as PlanType) || (plan as PlanType);
}

// Feature definitions with minimum required plan
export const PLAN_FEATURES: Record<FeatureKey, PlanFeature> = {
  // ── BASIC (22 features) ──────────────────────────────
  orders_management: {
    name: 'Orders Management',
    description: 'Sales order fulfillment with pick/pack workflow',
    minPlan: 'BASIC',
  },
  procurement_management: {
    name: 'Procurement',
    description: 'Purchase orders and goods receipt management',
    minPlan: 'BASIC',
  },
  carrier_integration: {
    name: 'Carrier Integration',
    description: 'Ship via Shiprocket, Delhivery, and other carriers',
    minPlan: 'BASIC',
  },
  customer_management: {
    name: 'Customer Management',
    description: 'Customer CRM hub with segmentation, tiers, and CLV analytics',
    minPlan: 'BASIC',
  },
  whatsapp_messages: {
    name: 'WhatsApp Messages',
    description: 'Send automated WhatsApp notifications to customers',
    minPlan: 'BASIC',
  },
  bulk_operations: {
    name: 'Bulk Operations',
    description: 'Import/export and bulk edit inventory',
    minPlan: 'BASIC',
  },
  perishable_management: {
    name: 'Perishable Management',
    description: 'FEFO picking, expiry alerts, and waste tracking',
    minPlan: 'BASIC',
  },
  cycle_counting: {
    name: 'Cycle Counting',
    description: 'Physical inventory counting workflow with variance tracking',
    minPlan: 'BASIC',
  },
  activity_feed: {
    name: 'Activity Feed',
    description: 'Business event log and activity timeline across all operations',
    minPlan: 'BASIC',
  },
  audit_trail: {
    name: 'Audit Trail',
    description: 'Track all changes with detailed audit logs',
    minPlan: 'BASIC',
  },
  shipping_analytics: {
    name: 'Shipping Analytics',
    description: 'Delivery performance KPIs, carrier metrics, and COD reconciliation',
    minPlan: 'BASIC',
  },
  demand_analytics: {
    name: 'Demand Analytics',
    description: 'Sales velocity tracking, moving averages, and demand patterns',
    minPlan: 'BASIC',
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Detailed reports, trends, and business insights',
    minPlan: 'BASIC',
  },
  reorder_suggestions: {
    name: 'Smart Reorder',
    description: 'Automated PO suggestions based on reorder points and lead times',
    minPlan: 'BASIC',
  },
  inventory_valuation: {
    name: 'Inventory Valuation',
    description: 'Valuation breakdowns, carrying cost analysis, and working capital metrics',
    minPlan: 'BASIC',
  },
  lost_sales: {
    name: 'Lost Sales Tracking',
    description: 'Log stockout events and analyze lost revenue impact',
    minPlan: 'BASIC',
  },
  decision_nudges: {
    name: 'Decision Support',
    description: 'Smart nudges, pipeline visibility, and ordering recommendations',
    minPlan: 'BASIC',
  },
  dynamic_pricing: {
    name: 'Dynamic Pricing',
    description: 'Inventory-level-based pricing rules and markdown scheduling',
    minPlan: 'BASIC',
  },
  supplier_performance: {
    name: 'Supplier Performance',
    description: 'Track lead times, quality, on-time delivery, and reliability scores',
    minPlan: 'BASIC',
  },
  bom_management: {
    name: 'BOM / Kit Management',
    description: 'Bill of materials, kit assembly, and disassembly workflows',
    minPlan: 'BASIC',
  },
  supplier_payment_terms: {
    name: 'Supplier Payment Terms',
    description: 'Payment tracking, payables aging, and trade credit visibility',
    minPlan: 'BASIC',
  },
  report_builder: {
    name: 'Report Builder',
    description: 'Custom reports with column selection, filters, and CSV/Excel export',
    minPlan: 'BASIC',
  },

  // ── BUSINESS (+11 features) ──────────────────────────
  multi_location: {
    name: 'Multi-Location',
    description: 'Manage inventory across multiple warehouses',
    minPlan: 'BUSINESS',
  },
  custom_roles: {
    name: 'Custom Roles',
    description: 'Create custom permission roles for your team',
    minPlan: 'BUSINESS',
  },
  custom_domain: {
    name: 'Custom Domain',
    description: 'Use your own domain for your inventory portal',
    minPlan: 'BUSINESS',
  },
  inventory_intelligence: {
    name: 'Inventory Intelligence',
    description: 'ABC/XYZ classification, safety stock, reorder optimization',
    minPlan: 'BUSINESS',
  },
  order_smoothing: {
    name: 'Order Smoothing',
    description: 'Bullwhip effect detection and EMA-smoothed order quantities',
    minPlan: 'BUSINESS',
  },
  warehouse_capacity: {
    name: 'Warehouse Capacity',
    description: 'Capacity tracking, utilization dashboards, and alerts',
    minPlan: 'BUSINESS',
  },
  lateral_transshipment: {
    name: 'Lateral Transshipment',
    description: 'Emergency stock transfers between locations with approval workflow',
    minPlan: 'BUSINESS',
  },
  placement_optimizer: {
    name: 'Placement Optimizer',
    description: 'Recommend optimal SKU allocation across warehouses based on demand',
    minPlan: 'BUSINESS',
  },
  workflow_automation: {
    name: 'Workflow Automation',
    description: 'Rule-based automation for reorder, pricing, notifications, and webhooks',
    minPlan: 'BUSINESS',
  },
  demand_forecasting: {
    name: 'Demand Forecasting',
    description: 'ML-based demand forecasting with Holt-Winters, regression, and ensemble methods',
    minPlan: 'BUSINESS',
  },
  assortment_planning: {
    name: 'Assortment Planning',
    description: 'Product scoring, lifecycle analysis, category health, and optimization suggestions',
    minPlan: 'BUSINESS',
  },

  // ── ENTERPRISE (+12 features) ────────────────────────
  api_access: {
    name: 'API Access',
    description: 'Full REST API access for integrations',
    minPlan: 'ENTERPRISE',
  },
  export_reports: {
    name: 'Export Reports',
    description: 'Download detailed PDF/CSV reports',
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
  priority_support: {
    name: 'Priority Support',
    description: '24/7 priority customer support',
    minPlan: 'ENTERPRISE',
  },
  outgoing_webhooks: {
    name: 'Outgoing Webhooks',
    description: 'Event-driven webhooks for third-party integrations',
    minPlan: 'ENTERPRISE',
  },
  multi_echelon: {
    name: 'Multi-Echelon Optimization',
    description: 'Cross-warehouse optimal stock distribution with echelon base-stock policies',
    minPlan: 'ENTERPRISE',
  },
  lot_genealogy: {
    name: 'Lot Genealogy & Traceability',
    description: 'Full chain traceability from supplier to customer with recall simulation',
    minPlan: 'ENTERPRISE',
  },
  sla_management: {
    name: 'SLA Management',
    description: 'Supplier SLA definitions, breach detection, penalty tracking, and compliance dashboard',
    minPlan: 'ENTERPRISE',
  },
  fleet_management: {
    name: 'Fleet Management',
    description: 'Vehicle, driver, and trip management for own-fleet delivery operations',
    minPlan: 'ENTERPRISE',
  },
  remanufacturing: {
    name: 'Remanufacturing',
    description: 'Disassembly BOM, yield tracking, and remanufactured SKU linkage',
    minPlan: 'ENTERPRISE',
  },
  supplier_portal: {
    name: 'Supplier Portal',
    description: 'Read-only access for suppliers to view stock levels, PO status, and velocity',
    minPlan: 'ENTERPRISE',
  },
};

// ── Plan Details ────────────────────────────────────────

export const PLAN_DETAILS: Record<PlanType, PlanDetails> = {
  TRIAL: {
    name: 'Trial',
    price: 0,
    yearlyPrice: 0,
    description: '14-day free trial of Basic features',
    features: [
      'Up to 500 products',
      '5 users (excl. admin)',
      '1 location',
      '200 invoices/mo',
      '2 GB storage',
      'All Basic features',
    ],
    limits: {
      products: 500,
      users: 5,
      locations: 1,
      invoices: 200,
      storage: 2,
    },
  },
  BASIC: {
    name: 'Basic',
    price: 599,
    yearlyPrice: 5990, // ₹499/mo effective
    description: 'Core operations for small shops',
    features: [
      'Up to 500 products',
      '5 users (excl. admin)',
      '1 location',
      '200 invoices/mo',
      '2 GB storage',
      'Orders & procurement',
      'Carrier integration',
      'WhatsApp messages',
      'Demand analytics',
      'Smart reorder',
      'Dynamic pricing',
      'BOM management',
    ],
    limits: {
      products: 500,
      users: 5,
      locations: 1,
      invoices: 200,
      storage: 2,
    },
  },
  BUSINESS: {
    name: 'Business',
    price: 3999,
    yearlyPrice: 39990, // ₹3,332/mo effective
    description: 'Multi-location growth features',
    features: [
      'Up to 5,000 products',
      '15 users (excl. admin)',
      '5 locations',
      'Unlimited invoices',
      '25 GB storage',
      'Everything in Basic',
      'Multi-location inventory',
      'Custom roles & domain',
      'Inventory intelligence',
      'Workflow automation',
      'Demand forecasting',
      'Add-on credits available',
    ],
    limits: {
      products: 5000,
      users: 15,
      locations: 5,
      invoices: -1,
      storage: 25,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 0, // Contact Sales
    yearlyPrice: 0,
    description: 'Compliance, traceability, white-label',
    features: [
      'Unlimited products',
      'Unlimited users',
      'Unlimited locations',
      'Unlimited invoices',
      '100 GB storage',
      'Everything in Business',
      'API access & webhooks',
      'White label & SSO',
      'Multi-echelon optimization',
      'Lot genealogy & traceability',
      'Fleet management',
      'Priority 24/7 support',
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

// ── Add-On Prices (Business plan only) ──────────────────

export const ADD_ON_PRICES: AddOnPrice[] = [
  {
    type: 'EXTRA_USERS',
    name: 'Extra Users',
    description: 'Per user beyond 15',
    pricePerUnit: 199,
    unit: 'user/mo',
    availableOn: ['BUSINESS'],
  },
  {
    type: 'EXTRA_SKUS',
    name: 'Extra SKUs',
    description: 'Per 500-SKU block',
    pricePerUnit: 299,
    unit: '500 SKUs/mo',
    availableOn: ['BUSINESS'],
  },
  {
    type: 'EXTRA_LOCATIONS',
    name: 'Extra Locations',
    description: 'Per location beyond 5',
    pricePerUnit: 499,
    unit: 'location/mo',
    availableOn: ['BUSINESS'],
  },
  {
    type: 'EXTRA_STORAGE',
    name: 'Extra Storage',
    description: 'Per 5 GB block',
    pricePerUnit: 149,
    unit: '5 GB/mo',
    availableOn: ['BUSINESS'],
  },
];

// ── Utility Functions ───────────────────────────────────

/**
 * Check if a plan has access to a feature.
 * TRIAL has the same features as BASIC.
 */
export function hasFeatureAccess(userPlan: PlanType | string, feature: FeatureKey): boolean {
  const plan = normalizePlanType(userPlan);
  const featureConfig = PLAN_FEATURES[feature];
  if (!featureConfig) return false;
  // Trial users get Basic features
  const effectiveLevel = plan === 'TRIAL' ? PLAN_HIERARCHY.BASIC : PLAN_HIERARCHY[plan];
  return effectiveLevel >= PLAN_HIERARCHY[featureConfig.minPlan];
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
export function getRecommendedUpgrade(currentPlan: PlanType | string): PlanType | null {
  const plan = normalizePlanType(currentPlan);
  const hierarchy: PlanType[] = ['TRIAL', 'BASIC', 'BUSINESS', 'ENTERPRISE'];
  const currentIndex = hierarchy.indexOf(plan);
  if (currentIndex === -1 || currentIndex >= hierarchy.length - 1) return null;
  return hierarchy[currentIndex + 1];
}

/**
 * Check if a plan can purchase add-ons
 */
export function canPurchaseAddOns(plan: PlanType | string): boolean {
  return normalizePlanType(plan) === 'BUSINESS';
}

/**
 * Get effective limits for a plan + active add-ons
 */
export function getEffectiveLimits(
  plan: PlanType | string,
  addOns?: { type: AddOnType; quantity: number }[]
): PlanDetails['limits'] {
  const normalizedPlan = normalizePlanType(plan);
  const baseLimits = { ...PLAN_DETAILS[normalizedPlan].limits };

  if (!addOns || addOns.length === 0) return baseLimits;

  for (const addOn of addOns) {
    switch (addOn.type) {
      case 'EXTRA_USERS':
        if (baseLimits.users !== -1) baseLimits.users += addOn.quantity;
        break;
      case 'EXTRA_SKUS':
        if (baseLimits.products !== -1) baseLimits.products += addOn.quantity * 500;
        break;
      case 'EXTRA_LOCATIONS':
        if (baseLimits.locations !== -1) baseLimits.locations += addOn.quantity;
        break;
      case 'EXTRA_STORAGE':
        if (baseLimits.storage !== -1) baseLimits.storage += addOn.quantity * 5;
        break;
    }
  }

  return baseLimits;
}

/**
 * Check if current usage is within plan limits
 */
export function isWithinLimits(
  limit: number,
  current: number
): { allowed: boolean; remaining: number; percentUsed: number } {
  if (limit === -1) return { allowed: true, remaining: Infinity, percentUsed: 0 };
  const remaining = limit - current;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    percentUsed: Math.round((current / limit) * 100),
  };
}

/**
 * Check if the plan is a trial plan
 */
export function isTrialPlan(plan: PlanType | string): boolean {
  const normalized = normalizePlanType(plan);
  return normalized === 'TRIAL';
}

/**
 * Get trial days remaining, or null if not on trial
 */
export function getTrialDaysRemaining(trialEndsAt: Date | string | null): number | null {
  if (!trialEndsAt) return null;
  const end = typeof trialEndsAt === 'string' ? new Date(trialEndsAt) : trialEndsAt;
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── Sidebar menu gating ────────────────────────────────

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
  '/pricing-rules': 'dynamic_pricing',
  '/warehouse-capacity': 'warehouse_capacity',
  '/lost-sales': 'lost_sales',
  '/decision-support': 'decision_nudges',
  '/transshipments': 'lateral_transshipment',
  '/placement-optimizer': 'placement_optimizer',
  '/automations': 'workflow_automation',
  '/customers': 'customer_management',
  '/reports': 'report_builder',
  '/settings/webhooks': 'outgoing_webhooks',
  '/bulk-operations': 'bulk_operations',
  '/activity': 'activity_feed',
  '/multi-echelon': 'multi_echelon',
  '/lot-genealogy': 'lot_genealogy',
  '/sla-management': 'sla_management',
  '/fleet': 'fleet_management',
  '/remanufacturing': 'remanufacturing',
};

// ── Analytics widget gating ─────────────────────────────

export const ANALYTICS_WIDGETS: Record<string, { minPlan: PlanType; name: string }> = {
  stats_overview: { minPlan: 'TRIAL', name: 'Stats Overview' },
  recent_activity: { minPlan: 'TRIAL', name: 'Recent Activity' },
  stock_levels: { minPlan: 'TRIAL', name: 'Stock Levels' },
  revenue_chart: { minPlan: 'BASIC', name: 'Revenue Trends' },
  low_stock_alerts: { minPlan: 'BASIC', name: 'Low Stock Alerts' },
  top_products: { minPlan: 'BASIC', name: 'Top Products' },
  sales_by_category: { minPlan: 'BASIC', name: 'Sales by Category' },
  inventory_turnover: { minPlan: 'BASIC', name: 'Inventory Turnover' },
  export_reports: { minPlan: 'ENTERPRISE', name: 'Export Reports' },
  demand_velocity: { minPlan: 'BASIC', name: 'Demand Velocity' },
  abc_xyz_matrix: { minPlan: 'BUSINESS', name: 'ABC/XYZ Matrix' },
  safety_stock: { minPlan: 'BUSINESS', name: 'Safety Stock' },
  reorder_suggestions: { minPlan: 'BASIC', name: 'Reorder Suggestions' },
  expiry_alerts: { minPlan: 'BASIC', name: 'Expiry Alerts' },
  dead_stock: { minPlan: 'BASIC', name: 'Dead Stock Detection' },
  order_smoothing: { minPlan: 'BUSINESS', name: 'Order Smoothing' },
  dynamic_pricing: { minPlan: 'BASIC', name: 'Dynamic Pricing' },
  warehouse_capacity: { minPlan: 'BUSINESS', name: 'Warehouse Capacity' },
  lost_sales: { minPlan: 'BASIC', name: 'Lost Sales Tracking' },
  decision_nudges: { minPlan: 'BASIC', name: 'Decision Support' },
  lateral_transshipment: { minPlan: 'BUSINESS', name: 'Lateral Transshipment' },
  placement_optimizer: { minPlan: 'BUSINESS', name: 'Placement Optimizer' },
  workflow_automation: { minPlan: 'BUSINESS', name: 'Workflow Automation' },
  customer_management: { minPlan: 'BASIC', name: 'Customer Management' },
  report_builder: { minPlan: 'BASIC', name: 'Report Builder' },
  outgoing_webhooks: { minPlan: 'ENTERPRISE', name: 'Outgoing Webhooks' },
  bulk_operations: { minPlan: 'BASIC', name: 'Bulk Operations' },
  activity_feed: { minPlan: 'BASIC', name: 'Activity Feed' },
  demand_forecasting: { minPlan: 'BUSINESS', name: 'Demand Forecasting' },
  assortment_planning: { minPlan: 'BUSINESS', name: 'Assortment Planning' },
  multi_echelon: { minPlan: 'ENTERPRISE', name: 'Multi-Echelon Optimization' },
  lot_genealogy: { minPlan: 'ENTERPRISE', name: 'Lot Genealogy' },
  sla_management: { minPlan: 'ENTERPRISE', name: 'SLA Management' },
  fleet_management: { minPlan: 'ENTERPRISE', name: 'Fleet Management' },
  remanufacturing: { minPlan: 'ENTERPRISE', name: 'Remanufacturing' },
};
