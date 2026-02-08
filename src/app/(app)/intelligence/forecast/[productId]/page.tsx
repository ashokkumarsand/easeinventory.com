'use client';

import React, { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ForecastChart } from '@/components/intelligence/ForecastChart';
import { ForecastMethodComparison } from '@/components/intelligence/ForecastMethodComparison';
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Brain,
  Package,
  TrendingUp,
  Target,
  ShoppingCart,
} from 'lucide-react';
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

interface HistoricalPoint {
  date: string;
  value: number;
}

interface ForecastRecord {
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
  product: {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    abcClass: string | null;
    leadTimeDays: number | null;
    reorderPoint: number | null;
    safetyStock: number | null;
  };
}

interface AccuracyLog {
  id: string;
  method: string;
  periodStart: string;
  periodEnd: string;
  mape: number;
  mae: number;
  bias: number;
  rmse: number;
  dataPoints: number;
  createdAt: string;
}

interface ProductForecastData {
  forecasts: ForecastRecord[];
  historical: HistoricalPoint[];
  accuracyLogs: AccuracyLog[];
}

// ============================================================
// Component
// ============================================================

export default function ForecastDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const [data, setData] = useState<ProductForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/forecasts/${productId}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Failed to fetch forecast detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await fetch(`/api/analytics/forecasts/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horizon: 30, lookback: 90 }),
      });
      await fetchData();
    } catch (e) {
      console.error('Failed to regenerate forecast:', e);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading forecast data...
      </div>
    );
  }

  if (!data || data.forecasts.length === 0) {
    return (
      <div className="space-y-4">
        <Link href="/intelligence?tab=forecasting">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to Forecasting
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Brain className="w-10 h-10 mb-3 opacity-50" />
            <p className="font-medium">No forecast available for this product</p>
            <p className="text-sm mt-1">Generate forecasts from the Intelligence dashboard first</p>
            <Button onClick={handleRegenerate} className="mt-4" size="sm" disabled={regenerating}>
              {regenerating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
              Generate Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const best = data.forecasts.find(f => f.isBest) ?? data.forecasts[0];
  const product = best.product;
  const bestForecast = best.forecastData;
  const forecastAvg = bestForecast.length > 0
    ? bestForecast.reduce((s, p) => s + p.value, 0) / bestForecast.length
    : 0;
  const daysOfSupply = forecastAvg > 0 ? Math.floor(product.quantity / forecastAvg) : 999;
  const confidence = best.mape !== null ? (best.mape < 10 ? 'HIGH' : best.mape < 30 ? 'MEDIUM' : 'LOW') : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/intelligence?tab=forecasting">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground">
              {product.sku && `${product.sku} · `}
              Forecast Detail
            </p>
          </div>
        </div>
        <Button onClick={handleRegenerate} disabled={regenerating} size="sm">
          {regenerating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
          Regenerate
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
              <Package className="w-3.5 h-3.5" />
              Current Stock
            </div>
            <div className="text-lg font-bold">{product.quantity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Forecast/Day
            </div>
            <div className="text-lg font-bold">{forecastAvg.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              Days of Supply
            </div>
            <div className={`text-lg font-bold ${daysOfSupply < 7 ? 'text-red-500' : daysOfSupply < 14 ? 'text-yellow-500' : ''}`}>
              {daysOfSupply >= 999 ? '∞' : daysOfSupply}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
              <Target className="w-3.5 h-3.5" />
              MAPE
            </div>
            <div className="text-lg font-bold">{best.mape !== null ? `${best.mape.toFixed(1)}%` : '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
              <Brain className="w-3.5 h-3.5" />
              Confidence
            </div>
            <div className="mt-0.5">
              {confidence ? (
                <Badge className={
                  confidence === 'HIGH' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                  confidence === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                  'bg-red-500/10 text-red-600 border-red-500/20'
                }>
                  {confidence}
                </Badge>
              ) : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Forecast Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Historical + Predicted Demand (Best: {best.method.replace('_', ' ')})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ForecastChart
            historical={data.historical}
            forecast={bestForecast}
            height={400}
          />
        </CardContent>
      </Card>

      {/* Method Comparison */}
      <ForecastMethodComparison forecasts={data.forecasts} />

      {/* Forecast-Driven Reorder Recommendation */}
      {forecastAvg > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Forecast-Based Reorder Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Reorder Point</div>
                <div className="font-semibold">
                  {product.reorderPoint ?? Math.ceil(forecastAvg * (product.leadTimeDays ?? 7))}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Safety Stock</div>
                <div className="font-semibold">{product.safetyStock ?? '—'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Lead Time</div>
                <div className="font-semibold">{product.leadTimeDays ?? 7} days</div>
              </div>
              <div>
                <div className="text-muted-foreground">Suggested Order Qty</div>
                <div className="font-semibold text-primary">
                  {Math.ceil(forecastAvg * (product.leadTimeDays ?? 7) * 2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accuracy History */}
      {data.accuracyLogs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Accuracy History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.accuracyLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                  <div>
                    <span className="font-medium">{log.method.replace('_', ' ')}</span>
                    <span className="text-muted-foreground ml-2">
                      {new Date(log.periodStart).toLocaleDateString()} — {new Date(log.periodEnd).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>MAPE: {log.mape.toFixed(1)}%</span>
                    <span className="text-muted-foreground">MAE: {log.mae.toFixed(2)}</span>
                    <span className="text-muted-foreground">{log.dataPoints} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
