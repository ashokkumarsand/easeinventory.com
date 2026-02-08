'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

interface ForecastPoint {
  date: string;
  value: number;
  lower: number;
  upper: number;
}

interface HistoricalPoint {
  date: string;
  value: number;
}

interface ForecastChartProps {
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
  height?: number;
  showConfidenceBands?: boolean;
}

export function ForecastChart({
  historical,
  forecast,
  height = 350,
  showConfidenceBands = true,
}: ForecastChartProps) {
  // Merge data into one timeline
  const data = [
    ...historical.map(h => ({
      date: h.date,
      historical: h.value,
      forecast: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
    })),
    // Overlap: last historical point is first forecast point
    ...forecast.map(f => ({
      date: f.date,
      historical: null as number | null,
      forecast: f.value,
      lower: f.lower,
      upper: f.upper,
    })),
  ];

  // Bridge: connect last historical to first forecast
  if (historical.length > 0 && forecast.length > 0) {
    const lastHistIdx = historical.length - 1;
    data[lastHistIdx] = {
      ...data[lastHistIdx],
      forecast: historical[lastHistIdx].value,
      lower: historical[lastHistIdx].value,
      upper: historical[lastHistIdx].value,
    };
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }}
          interval="preserveStartEnd"
          className="text-muted-foreground"
        />
        <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: 12,
          }}
          labelFormatter={(v) => `Date: ${v}`}
        />
        <Legend />

        {/* Confidence bands (shaded area) */}
        {showConfidenceBands && (
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="hsl(var(--primary))"
            fillOpacity={0.08}
            name="Upper Bound"
            connectNulls={false}
          />
        )}
        {showConfidenceBands && (
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="hsl(var(--background))"
            fillOpacity={1}
            name="Lower Bound"
            connectNulls={false}
          />
        )}

        {/* Historical line (solid) */}
        <Line
          type="monotone"
          dataKey="historical"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          name="Historical"
          connectNulls={false}
        />

        {/* Forecast line (dashed) */}
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={false}
          name="Forecast"
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
