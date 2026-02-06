'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, BarChart3, DollarSign, Package, ShoppingCart, Timer, XCircle } from 'lucide-react';

interface KpiData {
  turnover: { turnover: number; cogsValue: number; totalInventoryValue: number };
  gmroi: { gmroi: number; grossMargin: number; avgInventoryCost: number };
  daysOfSupply: { avgDaysOfSupply: number };
  fillRate: { fillRate: number; fulfilledCount: number; totalCount: number };
  stockout: { stockoutRate: number; zeroStockCount: number; totalActive: number };
}

interface KpiStatCardsProps {
  data: KpiData | null;
  isLoading?: boolean;
}

function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export function KpiStatCards({ data, isLoading }: KpiStatCardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-foreground/[0.06] skeleton-shimmer" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Inventory Turnover',
      value: data.turnover.turnover.toFixed(2),
      subtitle: `COGS: ${formatINR(data.turnover.cogsValue)}`,
      icon: BarChart3,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'GMROI',
      value: data.gmroi.gmroi.toFixed(2),
      subtitle: `Margin: ${formatINR(data.gmroi.grossMargin)}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Avg Days of Supply',
      value: `${data.daysOfSupply.avgDaysOfSupply}`,
      subtitle: 'across all products',
      icon: Timer,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Fill Rate',
      value: `${(data.fillRate.fillRate * 100).toFixed(1)}%`,
      subtitle: `${data.fillRate.fulfilledCount}/${data.fillRate.totalCount} orders`,
      icon: ShoppingCart,
      color: data.fillRate.fillRate >= 0.9 ? 'text-green-500' : 'text-amber-500',
      bgColor: data.fillRate.fillRate >= 0.9 ? 'bg-green-500/10' : 'bg-amber-500/10',
    },
    {
      label: 'Stockout Rate',
      value: `${(data.stockout.stockoutRate * 100).toFixed(1)}%`,
      subtitle: `${data.stockout.zeroStockCount} of ${data.stockout.totalActive} SKUs`,
      icon: XCircle,
      color: data.stockout.stockoutRate <= 0.05 ? 'text-green-500' : 'text-red-500',
      bgColor: data.stockout.stockoutRate <= 0.05 ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      label: 'Inventory Value',
      value: formatINR(data.turnover.totalInventoryValue),
      subtitle: 'at cost price',
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-black mt-1">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
