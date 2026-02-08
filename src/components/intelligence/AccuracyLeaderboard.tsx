'use client';

import React, { useEffect, useState } from 'react';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Trophy, AlertTriangle } from 'lucide-react';

interface LeaderboardItem {
  productId: string;
  productName: string;
  sku: string | null;
  mape: number;
  method: string;
}

interface MethodComparison {
  method: string;
  avgMAPE: number;
  count: number;
}

interface LeaderboardData {
  best: LeaderboardItem[];
  worst: LeaderboardItem[];
  methodComparison: MethodComparison[];
}

const METHOD_LABELS: Record<string, string> = {
  SMA: 'SMA',
  EMA: 'EMA',
  HOLT_WINTERS: 'Holt-Winters',
  LINEAR_REGRESSION: 'Lin. Regression',
  ENSEMBLE: 'Ensemble',
};

function ConfidenceBadge({ mape }: { mape: number }) {
  if (mape < 10)
    return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">HIGH</Badge>;
  if (mape < 30)
    return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">MEDIUM</Badge>;
  return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">LOW</Badge>;
}

export function AccuracyLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/forecasts/accuracy')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-muted-foreground">Loading accuracy data...</div>;
  }

  if (!data || (data.best.length === 0 && data.worst.length === 0)) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>No forecast accuracy data available. Generate forecasts first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Method Comparison Bar Chart */}
      {data.methodComparison.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Method Performance (Avg MAPE %)</CardTitle>
          </CardHeader>
          <CardContent role="img" aria-label="Bar chart comparing average MAPE across forecasting methods">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data.methodComparison.map(m => ({
                  method: METHOD_LABELS[m.method] ?? m.method,
                  avgMAPE: m.avgMAPE,
                  count: m.count,
                }))}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="method" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                  formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, 'Avg MAPE']}
                />
                <Bar dataKey="avgMAPE" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-500" />
              Most Accurate Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">MAPE</TableHead>
                  <TableHead className="text-right">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.best.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="font-medium text-sm">{item.productName}</div>
                      {item.sku && <div className="text-xs text-muted-foreground">{item.sku}</div>}
                    </TableCell>
                    <TableCell className="text-right text-sm">{item.mape.toFixed(1)}%</TableCell>
                    <TableCell className="text-right"><ConfidenceBadge mape={item.mape} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Worst Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Least Accurate Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">MAPE</TableHead>
                  <TableHead className="text-right">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.worst.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="font-medium text-sm">{item.productName}</div>
                      {item.sku && <div className="text-xs text-muted-foreground">{item.sku}</div>}
                    </TableCell>
                    <TableCell className="text-right text-sm">{item.mape.toFixed(1)}%</TableCell>
                    <TableCell className="text-right"><ConfidenceBadge mape={item.mape} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
