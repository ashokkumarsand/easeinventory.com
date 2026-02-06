'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AgingChartProps {
  data: Record<string, number> | null;
}

const BUCKET_COLORS = ['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];

function formatINR(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function AgingChart({ data }: AgingChartProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Inventory Aging</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No aging data available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { bucket: '0-30d', value: data['0-30'] || 0 },
    { bucket: '31-60d', value: data['31-60'] || 0 },
    { bucket: '61-90d', value: data['61-90'] || 0 },
    { bucket: '91-180d', value: data['91-180'] || 0 },
    { bucket: '180d+', value: data['180+'] || 0 },
  ];

  const totalValue = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Inventory Aging Analysis</CardTitle>
          <span className="text-xs text-muted-foreground">
            Total: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalValue)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${formatINR(v)}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: any) => [
                new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value ?? 0)),
                'Value',
              ]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={BUCKET_COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-3 mt-2">
          {chartData.map((d, i) => (
            <div key={d.bucket} className="flex items-center gap-1.5 text-[10px]">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: BUCKET_COLORS[i] }} />
              <span>{d.bucket}: {totalValue > 0 ? Math.round((d.value / totalValue) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
