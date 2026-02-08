'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Brain,
  Target,
  TrendingUp,
  BarChart3,
  Search,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { ForecastChart } from './ForecastChart';
import { AccuracyLeaderboard } from './AccuracyLeaderboard';
import Link from 'next/link';

// ============================================================
// Types
// ============================================================

interface ForecastPoint {
  date: string;
  value: number;
  lower: number;
  upper: number;
}

interface ProductForecastSummary {
  productId: string;
  productName: string;
  sku: string | null;
  abcClass: string | null;
  currentStock: number;
  avgDailyDemand: number;
  forecastedDailyDemand: number;
  daysOfSupply: number;
  bestMethod: string | null;
  mape: number | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  forecastHorizonDays: number;
}

interface DashboardData {
  summary: {
    productsForecasted: number;
    avgMAPE: number;
    highConfidenceCount: number;
    methodDistribution: Record<string, number>;
  };
  aggregateForecast: ForecastPoint[];
  products: ProductForecastSummary[];
  total: number;
  page: number;
  pageSize: number;
}

const METHOD_LABELS: Record<string, string> = {
  SMA: 'SMA',
  EMA: 'EMA',
  HOLT_WINTERS: 'Holt-Winters',
  LINEAR_REGRESSION: 'Lin. Reg.',
  ENSEMBLE: 'Ensemble',
};

// ============================================================
// Component
// ============================================================

export function ForecastDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [abcFilter, setAbcFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'overview' | 'accuracy'>('overview');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '25' });
      if (search) params.set('search', search);
      if (abcFilter !== 'all') params.set('abcClass', abcFilter);
      const res = await fetch(`/api/analytics/forecasts?${params}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Failed to fetch forecast dashboard:', e);
    } finally {
      setLoading(false);
    }
  }, [page, search, abcFilter]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await fetch('/api/analytics/forecasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horizon: 30, lookback: 90 }),
      });
      await fetchDashboard();
    } catch (e) {
      console.error('Failed to generate forecasts:', e);
    } finally {
      setGenerating(false);
    }
  };

  function ConfidenceBadge({ confidence }: { confidence: string | null }) {
    if (!confidence) return <span className="text-muted-foreground">—</span>;
    const map: Record<string, string> = {
      HIGH: 'bg-green-500/10 text-green-600 border-green-500/20',
      MEDIUM: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      LOW: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    return <Badge className={map[confidence] ?? ''}>{confidence}</Badge>;
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            variant={tab === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={tab === 'accuracy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('accuracy')}
          >
            Accuracy
          </Button>
        </div>
        <Button onClick={handleGenerate} disabled={generating} size="sm">
          {generating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
          {generating ? 'Generating...' : 'Generate Forecasts'}
        </Button>
      </div>

      {tab === 'accuracy' ? (
        <AccuracyLeaderboard />
      ) : (
        <>
          {/* Stat Cards */}
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Brain className="w-4 h-4" />
                    Products Forecasted
                  </div>
                  <div className="text-2xl font-bold">{data.summary.productsForecasted}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="w-4 h-4" />
                    Avg MAPE
                  </div>
                  <div className="text-2xl font-bold">{data.summary.avgMAPE.toFixed(1)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="w-4 h-4" />
                    High Confidence
                  </div>
                  <div className="text-2xl font-bold">{data.summary.highConfidenceCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <BarChart3 className="w-4 h-4" />
                    Top Method
                  </div>
                  <div className="text-2xl font-bold">
                    {Object.entries(data.summary.methodDistribution)
                      .sort(([, a], [, b]) => b - a)[0]?.[0]
                      ? METHOD_LABELS[
                          Object.entries(data.summary.methodDistribution)
                            .sort(([, a], [, b]) => b - a)[0][0]
                        ] ?? '—'
                      : '—'}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Aggregate Forecast Chart */}
          {data && data.aggregateForecast.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Aggregate Demand Forecast (All Products)</CardTitle>
              </CardHeader>
              <CardContent>
                <ForecastChart historical={[]} forecast={data.aggregateForecast} height={250} />
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={abcFilter} onValueChange={(v) => { setAbcFilter(v); setPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="ABC Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="A">Class A</SelectItem>
                <SelectItem value="B">Class B</SelectItem>
                <SelectItem value="C">Class C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Table */}
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading forecasts...
            </div>
          ) : data && data.products.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">ABC</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Forecast/Day</TableHead>
                      <TableHead className="text-right">Days Supply</TableHead>
                      <TableHead className="text-center">Method</TableHead>
                      <TableHead className="text-right">MAPE</TableHead>
                      <TableHead className="text-center">Confidence</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products.map(p => (
                      <TableRow key={p.productId}>
                        <TableCell>
                          <div className="font-medium text-sm">{p.productName}</div>
                          {p.sku && <div className="text-xs text-muted-foreground">{p.sku}</div>}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.abcClass ? (
                            <Badge variant="outline" className="text-xs">{p.abcClass}</Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right">{p.currentStock}</TableCell>
                        <TableCell className="text-right">{p.forecastedDailyDemand.toFixed(1)}</TableCell>
                        <TableCell className="text-right">
                          <span className={p.daysOfSupply < 7 ? 'text-red-500 font-medium' : p.daysOfSupply < 14 ? 'text-yellow-500' : ''}>
                            {p.daysOfSupply >= 999 ? '∞' : p.daysOfSupply}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {p.bestMethod ? METHOD_LABELS[p.bestMethod] ?? p.bestMethod : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.mape !== null ? `${p.mape.toFixed(1)}%` : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <ConfidenceBadge confidence={p.confidence} />
                        </TableCell>
                        <TableCell>
                          <Link href={`/intelligence/forecast/${p.productId}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Brain className="w-10 h-10 mb-3 opacity-50" />
                <p className="font-medium">No forecasts yet</p>
                <p className="text-sm mt-1">Click &quot;Generate Forecasts&quot; to analyze demand patterns</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {data && data.total > data.pageSize && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-2">
                Page {data.page} of {Math.ceil(data.total / data.pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(data.total / data.pageSize)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
