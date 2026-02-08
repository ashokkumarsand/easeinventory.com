'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface KpiSnapshot {
  periodDate: string;
  inventoryTurnover: number | null;
  gmroi: number | null;
  fillRate: number | null;
  stockoutRate: number | null;
}

interface KpiTrendChartProps {
  data: KpiSnapshot[];
}

export function KpiTrendChart({ data }: KpiTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">KPI Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No historical data yet. Save a KPI snapshot to start tracking trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(d => ({
    date: d.periodDate,
    turnover: d.inventoryTurnover ? Number(d.inventoryTurnover) : null,
    gmroi: d.gmroi ? Number(d.gmroi) : null,
    fillRate: d.fillRate ? Number(d.fillRate) * 100 : null,
    stockoutRate: d.stockoutRate ? Number(d.stockoutRate) * 100 : null,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">KPI Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent role="img" aria-label="Line chart showing KPI trends over time including turnover, GMROI, fill rate, and stockout rate">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="turnover" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={false} name="Turnover" />
            <Line type="monotone" dataKey="gmroi" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} name="GMROI" />
            <Line type="monotone" dataKey="fillRate" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={false} name="Fill Rate %" />
            <Line type="monotone" dataKey="stockoutRate" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} name="Stockout %" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
