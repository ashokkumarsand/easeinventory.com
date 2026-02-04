'use client';

import {
  ExportReports,
  InventoryTurnover,
  LowStockAlerts,
  RecentActivity,
  StatsOverview,
  StockLevels,
  TopProducts,
} from '@/components/analytics';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { usePermissions } from '@/hooks/usePermissions';
import { ANALYTICS_WIDGETS, PlanType, PLAN_HIERARCHY } from '@/lib/plan-features';
import { Card, CardBody, Chip, Skeleton } from '@heroui/react';
import { BarChart3, Lock, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic imports for chart components to avoid SSR issues with Recharts
const RevenueChart = dynamic(
  () => import('@/components/analytics/RevenueChart').then((mod) => mod.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <Card className="border border-foreground/5">
        <CardBody className="p-6">
          <Skeleton className="h-[350px] rounded-xl" />
        </CardBody>
      </Card>
    ),
  }
);

const SalesByCategory = dynamic(
  () => import('@/components/analytics/SalesByCategory').then((mod) => mod.SalesByCategory),
  {
    ssr: false,
    loading: () => (
      <Card className="border border-foreground/5">
        <CardBody className="p-6">
          <Skeleton className="h-[350px] rounded-xl" />
        </CardBody>
      </Card>
    ),
  }
);

// Widget wrapper component - defined outside to prevent recreation on render
function WidgetWrapper({
  widgetKey,
  children,
  plan,
  onUpgradeClick,
}: {
  widgetKey: string;
  children: React.ReactNode;
  plan: PlanType;
  onUpgradeClick: () => void;
}) {
  const widgetInfo = ANALYTICS_WIDGETS[widgetKey];
  const isAvailable = widgetInfo
    ? PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[widgetInfo.minPlan]
    : true;

  if (!isAvailable && widgetInfo) {
    return (
      <Card className="border border-foreground/5 relative overflow-hidden">
        <CardBody className="p-6">
          {/* Blurred preview */}
          <div className="opacity-30 blur-sm pointer-events-none">{children}</div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <p className="font-bold text-sm mb-1">{widgetInfo.name}</p>
              <p className="text-xs text-foreground/50 mb-3">
                Requires {widgetInfo.minPlan} plan
              </p>
              <button
                onClick={onUpgradeClick}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mx-auto"
              >
                <Sparkles className="w-3 h-3" />
                Upgrade Now
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return <>{children}</>;
}

export default function AnalyticsPage() {
  const { plan, showUpgradeModal } = usePlanFeatures();
  const { canViewAnalytics } = usePermissions();

  // Check if user has permission to view analytics
  if (!canViewAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-danger" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-foreground/50 max-w-md">
          You don&apos;t have permission to view analytics. Contact your administrator to request access.
        </p>
      </div>
    );
  }

  const handleUpgradeClick = () => showUpgradeModal();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
          </div>
          <p className="text-foreground/50">
            Track your business performance and make data-driven decisions
          </p>
        </div>
        <Chip
          color={plan === 'ENTERPRISE' ? 'warning' : plan === 'BUSINESS' ? 'secondary' : 'default'}
          variant="flat"
          startContent={<Sparkles className="w-3 h-3" />}
        >
          {plan} Plan
        </Chip>
      </div>

      {/* Stats Overview - Available to all */}
      <WidgetWrapper widgetKey="stats_overview" plan={plan} onUpgradeClick={handleUpgradeClick}>
        <StatsOverview />
      </WidgetWrapper>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart - STARTER+ */}
          <WidgetWrapper widgetKey="revenue_chart" plan={plan} onUpgradeClick={handleUpgradeClick}>
            <RevenueChart />
          </WidgetWrapper>

          {/* Two Column Grid for smaller widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Products - BUSINESS+ */}
            <WidgetWrapper widgetKey="top_products" plan={plan} onUpgradeClick={handleUpgradeClick}>
              <TopProducts />
            </WidgetWrapper>

            {/* Sales by Category - BUSINESS+ */}
            <WidgetWrapper widgetKey="sales_by_category" plan={plan} onUpgradeClick={handleUpgradeClick}>
              <SalesByCategory />
            </WidgetWrapper>
          </div>

          {/* Inventory Turnover - BUSINESS+ */}
          <WidgetWrapper widgetKey="inventory_turnover" plan={plan} onUpgradeClick={handleUpgradeClick}>
            <InventoryTurnover />
          </WidgetWrapper>
        </div>

        {/* Right Column - Lists & Alerts */}
        <div className="space-y-6">
          {/* Stock Levels - FREE+ */}
          <WidgetWrapper widgetKey="stock_levels" plan={plan} onUpgradeClick={handleUpgradeClick}>
            <StockLevels />
          </WidgetWrapper>

          {/* Low Stock Alerts - STARTER+ */}
          <WidgetWrapper widgetKey="low_stock_alerts" plan={plan} onUpgradeClick={handleUpgradeClick}>
            <LowStockAlerts />
          </WidgetWrapper>

          {/* Recent Activity - FREE+ */}
          <WidgetWrapper widgetKey="recent_activity" plan={plan} onUpgradeClick={handleUpgradeClick}>
            <RecentActivity />
          </WidgetWrapper>

          {/* Export Reports - ENTERPRISE only */}
          <WidgetWrapper widgetKey="export_reports" plan={plan} onUpgradeClick={handleUpgradeClick}>
            <ExportReports />
          </WidgetWrapper>
        </div>
      </div>
    </div>
  );
}
