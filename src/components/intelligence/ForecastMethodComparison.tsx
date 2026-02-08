'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
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

interface MethodForecast {
  id: string;
  method: string;
  horizonDays: number;
  forecastData: ForecastPoint[];
  mape: number | null;
  mae: number | null;
  bias: number | null;
  rmse: number | null;
  parameters: Record<string, number>;
  isBest: boolean;
}

const METHOD_COLORS: Record<string, string> = {
  SMA: 'hsl(var(--chart-1))',
  EMA: 'hsl(var(--chart-2))',
  HOLT_WINTERS: 'hsl(var(--chart-3))',
  LINEAR_REGRESSION: 'hsl(var(--chart-4))',
  ENSEMBLE: 'hsl(var(--primary))',
};

const METHOD_LABELS: Record<string, string> = {
  SMA: 'Simple Moving Avg',
  EMA: 'Exponential MA',
  HOLT_WINTERS: 'Holt-Winters',
  LINEAR_REGRESSION: 'Linear Regression',
  ENSEMBLE: 'Ensemble',
};

interface ForecastMethodComparisonProps {
  forecasts: MethodForecast[];
}

export function ForecastMethodComparison({ forecasts }: ForecastMethodComparisonProps) {
  if (forecasts.length === 0) return null;

  // Build chart data: all methods on one chart
  const dateSet = new Set<string>();
  for (const f of forecasts) {
    for (const p of f.forecastData) dateSet.add(p.date);
  }
  const dates = Array.from(dateSet).sort();

  const chartData = dates.map(date => {
    const point: Record<string, string | number | null> = { date };
    for (const f of forecasts) {
      const match = f.forecastData.find(p => p.date === date);
      point[f.method] = match ? match.value : null;
    }
    return point;
  });

  return (
    <div className="space-y-4">
      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Method Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
              <Legend />
              {forecasts.map(f => (
                <Line
                  key={f.method}
                  type="monotone"
                  dataKey={f.method}
                  stroke={METHOD_COLORS[f.method] ?? 'hsl(var(--muted-foreground))'}
                  strokeWidth={f.isBest ? 3 : 1.5}
                  strokeDasharray={f.isBest ? undefined : '4 2'}
                  dot={false}
                  name={METHOD_LABELS[f.method] ?? f.method}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Accuracy Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Accuracy Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">MAPE</TableHead>
                <TableHead className="text-right">MAE</TableHead>
                <TableHead className="text-right">Bias</TableHead>
                <TableHead className="text-right">RMSE</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecasts
                .sort((a, b) => (a.mape ?? 999) - (b.mape ?? 999))
                .map(f => (
                  <TableRow key={f.method} className={f.isBest ? 'bg-primary/5' : ''}>
                    <TableCell className="font-medium">
                      {METHOD_LABELS[f.method] ?? f.method}
                    </TableCell>
                    <TableCell className="text-right">
                      {f.mape !== null ? `${f.mape.toFixed(1)}%` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {f.mae !== null ? f.mae.toFixed(2) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {f.bias !== null ? f.bias.toFixed(2) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {f.rmse !== null ? f.rmse.toFixed(2) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {f.isBest ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          Best
                        </Badge>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
