'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CarryingCostData {
  totalInventoryValue: number;
  annualRate: number;
  annualCarryingCost: number;
  monthlyCarryingCost: number;
  breakdown: Record<string, { label: string; pct: number; amount: number }>;
}

interface CarryingCostBreakdownProps {
  data: CarryingCostData | null;
}

const COLORS = ['hsl(258, 90%, 66%)', 'hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export function CarryingCostBreakdown({ data }: CarryingCostBreakdownProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Carrying Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.values(data.breakdown).map(b => ({
    name: b.label,
    value: b.amount,
    pct: b.pct,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Carrying Cost Breakdown</CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Annual: {formatINR(data.annualCarryingCost)}</p>
            <p className="text-xs text-muted-foreground">Monthly: {formatINR(data.monthlyCarryingCost)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent role="img" aria-label="Donut chart showing carrying cost breakdown by component">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              dataKey="value"
              label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
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
              formatter={(value: any, name: any) => [formatINR(Number(value ?? 0)), name]}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Rate: {(data.annualRate * 100).toFixed(0)}% of inventory value per year
        </p>
      </CardContent>
    </Card>
  );
}
