'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';

interface TurnoverCategory {
  name: string;
  turnoverRate: number; // times per year
  avgDaysToSell: number;
  trend: number; // percentage change
}

// Mock data
const turnoverData: TurnoverCategory[] = [
  { name: 'Electronics', turnoverRate: 8.2, avgDaysToSell: 44, trend: 5.2 },
  { name: 'Accessories', turnoverRate: 12.4, avgDaysToSell: 29, trend: 8.7 },
  { name: 'Parts & Components', turnoverRate: 6.1, avgDaysToSell: 60, trend: -2.3 },
  { name: 'Services', turnoverRate: 15.8, avgDaysToSell: 23, trend: 12.1 },
];

const getTurnoverHealth = (rate: number): { label: string; colorClass: string } => {
  if (rate >= 10) return { label: 'Excellent', colorClass: 'bg-green-500/10 text-green-600' };
  if (rate >= 6) return { label: 'Good', colorClass: 'bg-yellow-500/10 text-yellow-600' };
  return { label: 'Needs attention', colorClass: 'bg-destructive/10 text-destructive' };
};

interface InventoryTurnoverProps {
  isLoading?: boolean;
}

export function InventoryTurnover({ isLoading }: InventoryTurnoverProps) {
  const avgTurnover = turnoverData.reduce((sum, c) => sum + c.turnoverRate, 0) / turnoverData.length;
  const avgDays = turnoverData.reduce((sum, c) => sum + c.avgDaysToSell, 0) / turnoverData.length;

  if (isLoading) {
    return (
      <Card className="border border-foreground/5">
        <CardHeader>
          <Skeleton className="h-6 w-40 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-foreground/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
            <RotateCcw className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Inventory Turnover</h3>
            <p className="text-sm text-foreground/50">How fast stock is selling</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-5">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide">Avg Turnover Rate</p>
            <p className="text-2xl font-black mt-1">{avgTurnover.toFixed(1)}x</p>
            <p className="text-xs text-foreground/40">per year</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide">Avg Days to Sell</p>
            <p className="text-2xl font-black mt-1">{Math.round(avgDays)}</p>
            <p className="text-xs text-foreground/40">days</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          {turnoverData.map((category) => {
            const health = getTurnoverHealth(category.turnoverRate);
            const maxRate = 20; // for progress bar scaling
            const progressValue = Math.min((category.turnoverRate / maxRate) * 100, 100);

            return (
              <div key={category.name} className="p-3 rounded-xl bg-foreground/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{category.name}</span>
                    <Badge variant="secondary" className={`text-[10px] h-5 ${health.colorClass}`}>
                      {health.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {category.trend >= 0 ? (
                      <ArrowUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className={category.trend >= 0 ? 'text-green-500' : 'text-destructive'}>
                      {Math.abs(category.trend)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress
                    value={progressValue}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm font-bold w-14 text-right">{category.turnoverRate}x</span>
                </div>
                <p className="text-[10px] text-foreground/40 mt-1">
                  Avg {category.avgDaysToSell} days to sell
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
