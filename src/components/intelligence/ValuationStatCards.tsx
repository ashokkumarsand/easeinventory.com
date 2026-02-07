'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Calendar, DollarSign, Landmark, Package, TrendingDown } from 'lucide-react';

interface ValuationData {
  summary: {
    totalValueAtCost: number;
    totalValueAtSale: number;
    potentialMargin: number;
    marginPct: number;
    totalSKUs: number;
  };
  carryingCost: {
    monthlyCarryingCost: number;
  };
  workingCapital: {
    capitalTiedUp: number;
    inventoryToRevenueRatio: number;
    inventoryDays: number;
  };
}

interface ValuationStatCardsProps {
  data: ValuationData | null;
  isLoading?: boolean;
}

function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export function ValuationStatCards({ data, isLoading }: ValuationStatCardsProps) {
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
      label: 'Total Value (Cost)',
      value: formatINR(data.summary.totalValueAtCost),
      subtitle: `${data.summary.totalSKUs} active SKUs`,
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Total Value (Sale)',
      value: formatINR(data.summary.totalValueAtSale),
      subtitle: `Margin: ${data.summary.marginPct.toFixed(1)}%`,
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Carrying Cost/Month',
      value: formatINR(data.carryingCost.monthlyCarryingCost),
      subtitle: 'inventory holding cost',
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Capital Tied Up',
      value: formatINR(data.workingCapital.capitalTiedUp),
      subtitle: 'in current inventory',
      icon: Landmark,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Inventory-to-Revenue',
      value: data.workingCapital.inventoryToRevenueRatio.toFixed(2) + 'x',
      subtitle: 'lower is better',
      icon: BarChart3,
      color: data.workingCapital.inventoryToRevenueRatio <= 1 ? 'text-green-500' : 'text-amber-500',
      bgColor: data.workingCapital.inventoryToRevenueRatio <= 1 ? 'bg-green-500/10' : 'bg-amber-500/10',
    },
    {
      label: 'Inventory Days',
      value: data.workingCapital.inventoryDays >= 999 ? 'N/A' : `${Math.round(data.workingCapital.inventoryDays)}`,
      subtitle: 'days to sell inventory',
      icon: Calendar,
      color: data.workingCapital.inventoryDays <= 60 ? 'text-green-500' : 'text-blue-500',
      bgColor: data.workingCapital.inventoryDays <= 60 ? 'bg-green-500/10' : 'bg-blue-500/10',
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
