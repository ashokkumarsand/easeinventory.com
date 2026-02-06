'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DemandChartProps {
  title?: string;
  data: { date: string; quantity: number; ma7?: number; ma30?: number }[];
}

export function DemandChart({ title = 'Daily Demand', data }: DemandChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No demand data available for charting</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
              labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="quantity"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Daily Demand"
            />
            {data.some(d => d.ma7 != null) && (
              <Line
                type="monotone"
                dataKey="ma7"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name="7-day MA"
              />
            )}
            {data.some(d => d.ma30 != null) && (
              <Line
                type="monotone"
                dataKey="ma30"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                name="30-day MA"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
