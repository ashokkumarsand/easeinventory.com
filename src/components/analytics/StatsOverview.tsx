'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

function StatCard({ title, value, change, changeLabel, icon, trend, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="border border-foreground/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-20 rounded-lg" />
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-3 w-24 rounded-lg" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-foreground/5 hover:border-foreground/10 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-foreground/50 font-medium">{title}</p>
            <p className="text-3xl font-black mt-2 tracking-tight">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : trend === 'down' ? (
                <ArrowDown className="w-4 h-4 text-destructive" />
              ) : null}
              <span
                className={`text-sm font-semibold ${
                  trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-destructive' : 'text-foreground/50'
                }`}
              >
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-foreground/40 ml-1">{changeLabel}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsOverviewProps {
  isLoading?: boolean;
}

export function StatsOverview({ isLoading }: StatsOverviewProps) {
  // Mock data - in production this would come from API
  const stats = [
    {
      title: 'Total Revenue',
      value: '₹4,52,890',
      change: 12.5,
      changeLabel: 'vs last month',
      icon: <DollarSign className="w-6 h-6" />,
      trend: 'up' as const,
    },
    {
      title: 'Products in Stock',
      value: '1,284',
      change: -2.3,
      changeLabel: 'vs last month',
      icon: <Package className="w-6 h-6" />,
      trend: 'down' as const,
    },
    {
      title: 'Orders This Month',
      value: '342',
      change: 8.1,
      changeLabel: 'vs last month',
      icon: <ShoppingCart className="w-6 h-6" />,
      trend: 'up' as const,
    },
    {
      title: 'Active Customers',
      value: '89',
      change: 5.2,
      changeLabel: 'vs last month',
      icon: <Users className="w-6 h-6" />,
      trend: 'up' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} isLoading={isLoading} />
      ))}
    </div>
  );
}
