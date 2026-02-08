'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DemandVelocityTable } from '@/components/intelligence/DemandVelocityTable';
import { SafetyStockCalculator } from '@/components/intelligence/SafetyStockCalculator';
import { ClassificationTable } from '@/components/intelligence/ClassificationTable';
import { KpiDashboard } from '@/components/intelligence/KpiDashboard';
import { ExpiringLotsTable } from '@/components/intelligence/ExpiringLotsTable';
import { ReorderSuggestionsTable } from '@/components/intelligence/ReorderSuggestionsTable';
import { DeadStockTable } from '@/components/intelligence/DeadStockTable';
import { SlowMoverTable } from '@/components/intelligence/SlowMoverTable';
import { ValuationDashboard } from '@/components/intelligence/ValuationDashboard';
import { OrderSmoothingDashboard } from '@/components/intelligence/OrderSmoothingDashboard';
import { ForecastDashboard } from '@/components/intelligence/ForecastDashboard';
import { Brain, TrendingUp, Shield, Grid3X3, BarChart3, Clock, ShoppingCart, PackageX, TrendingDown, Landmark, Activity, Sparkles } from 'lucide-react';

const TABS = [
  { value: 'demand', label: 'Demand', icon: TrendingUp },
  { value: 'safety-stock', label: 'Safety Stock', icon: Shield },
  { value: 'classification', label: 'ABC/XYZ', icon: Grid3X3 },
  { value: 'kpis', label: 'KPIs', icon: BarChart3 },
  { value: 'perishables', label: 'Perishables', icon: Clock },
  { value: 'reorder', label: 'Reorder', icon: ShoppingCart },
  { value: 'dead-stock', label: 'Dead Stock', icon: PackageX },
  { value: 'slow-movers', label: 'Slow Movers', icon: TrendingDown },
  { value: 'valuation', label: 'Valuation', icon: Landmark },
  { value: 'order-smoothing', label: 'Smoothing', icon: Activity },
  { value: 'forecasting', label: 'Forecasting', icon: Sparkles },
] as const;

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState('demand');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight font-heading">Inventory Intelligence</h1>
          <p className="text-sm text-muted-foreground">Data-driven insights to optimize your inventory</p>
        </div>
      </div>

      {/* Tab Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          {TABS.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 shrink-0">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="demand" className="mt-6">
          <DemandVelocityTable />
        </TabsContent>

        <TabsContent value="safety-stock" className="mt-6">
          <SafetyStockCalculator />
        </TabsContent>

        <TabsContent value="classification" className="mt-6">
          <ClassificationTable />
        </TabsContent>

        <TabsContent value="kpis" className="mt-6">
          <KpiDashboard />
        </TabsContent>

        <TabsContent value="perishables" className="mt-6">
          <ExpiringLotsTable />
        </TabsContent>

        <TabsContent value="reorder" className="mt-6">
          <ReorderSuggestionsTable />
        </TabsContent>

        <TabsContent value="dead-stock" className="mt-6">
          <DeadStockTable />
        </TabsContent>

        <TabsContent value="slow-movers" className="mt-6">
          <SlowMoverTable />
        </TabsContent>

        <TabsContent value="valuation" className="mt-6">
          <ValuationDashboard />
        </TabsContent>

        <TabsContent value="order-smoothing" className="mt-6">
          <OrderSmoothingDashboard />
        </TabsContent>

        <TabsContent value="forecasting" className="mt-6">
          <ForecastDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
