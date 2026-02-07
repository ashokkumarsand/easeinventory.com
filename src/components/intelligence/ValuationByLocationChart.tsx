'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LocationData {
  name: string;
  code: string | null;
  type: string;
  valueAtCost: number;
  valueAtSale: number;
  skuCount: number;
  totalUnits: number;
}

interface ValuationByLocationChartProps {
  data: { locations: LocationData[] } | null;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export function ValuationByLocationChart({ data }: ValuationByLocationChartProps) {
  if (!data || data.locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Valuation by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No multi-location data. Add locations to see distribution.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.locations.map((l, i) => ({
    name: l.name,
    value: l.valueAtCost,
    skuCount: l.skuCount,
    totalUnits: l.totalUnits,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Valuation by Location</CardTitle>
          <span className="text-xs text-muted-foreground">{data.locations.length} locations</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: any) => [
                new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value ?? 0)),
                'Value (Cost)',
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
