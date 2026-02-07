'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CategoryData {
  name: string;
  valueAtCost: number;
  valueAtSale: number;
  skuCount: number;
  totalUnits: number;
}

interface ValuationByCategoryChartProps {
  data: { categories: CategoryData[] } | null;
}

function formatINR(value: number) {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function ValuationByCategoryChart({ data }: ValuationByCategoryChartProps) {
  if (!data || data.categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Valuation by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No category data available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.categories.slice(0, 10).map(c => ({
    name: c.name.length > 15 ? c.name.slice(0, 14) + '...' : c.name,
    'Cost Value': c.valueAtCost,
    'Sale Value': c.valueAtSale,
    skuCount: c.skuCount,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Valuation by Category (Top 10)</CardTitle>
          <span className="text-xs text-muted-foreground">{data.categories.length} categories</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${formatINR(v)}`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: any) => [
                new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value ?? 0)),
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Cost Value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Sale Value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
