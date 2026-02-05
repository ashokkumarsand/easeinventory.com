'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Mock data for demonstration
const generateData = (period: string) => {
  if (period === '7d') {
    return [
      { name: 'Mon', revenue: 24000, orders: 12 },
      { name: 'Tue', revenue: 31000, orders: 15 },
      { name: 'Wed', revenue: 28000, orders: 14 },
      { name: 'Thu', revenue: 35000, orders: 18 },
      { name: 'Fri', revenue: 42000, orders: 22 },
      { name: 'Sat', revenue: 38000, orders: 19 },
      { name: 'Sun', revenue: 29000, orders: 13 },
    ];
  }
  if (period === '30d') {
    return Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      revenue: Math.floor(Math.random() * 50000) + 20000,
      orders: Math.floor(Math.random() * 25) + 10,
    }));
  }
  // 12 months
  return [
    { name: 'Jan', revenue: 452000, orders: 234 },
    { name: 'Feb', revenue: 512000, orders: 267 },
    { name: 'Mar', revenue: 478000, orders: 248 },
    { name: 'Apr', revenue: 523000, orders: 279 },
    { name: 'May', revenue: 589000, orders: 312 },
    { name: 'Jun', revenue: 612000, orders: 328 },
    { name: 'Jul', revenue: 567000, orders: 298 },
    { name: 'Aug', revenue: 634000, orders: 341 },
    { name: 'Sep', revenue: 598000, orders: 318 },
    { name: 'Oct', revenue: 678000, orders: 365 },
    { name: 'Nov', revenue: 712000, orders: 387 },
    { name: 'Dec', revenue: 689000, orders: 372 },
  ];
};

const formatCurrency = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return `₹${value}`;
};

interface RevenueChartProps {
  isLoading?: boolean;
}

export function RevenueChart({ isLoading }: RevenueChartProps) {
  const [period, setPeriod] = useState('30d');
  const data = generateData(period);

  if (isLoading) {
    return (
      <Card className="border border-foreground/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-foreground/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <h3 className="text-lg font-bold">Revenue Trends</h3>
          <p className="text-sm text-foreground/50">Track your income over time</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32 bg-foreground/5 border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground) / 0.1)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--foreground) / 0.5)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--foreground) / 0.1)' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: 'hsl(var(--foreground) / 0.5)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--foreground) / 0.1)' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--foreground) / 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => [formatCurrency(value as number), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
