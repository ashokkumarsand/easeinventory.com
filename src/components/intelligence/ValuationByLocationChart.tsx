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

const COLORS = ['hsl(258, 90%, 66%)', 'hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(330, 81%, 60%)', 'hsl(188, 95%, 43%)', 'hsl(84, 81%, 44%)'];

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
      <CardContent role="img" aria-label="Pie chart showing inventory valuation distribution by location">
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
