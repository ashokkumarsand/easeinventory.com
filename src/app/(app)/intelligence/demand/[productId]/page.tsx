'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DemandChart } from '@/components/intelligence/DemandChart';
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface DemandDetail {
  productId: string;
  productName: string;
  sku: string | null;
  avgDailyDemand: number;
  avgWeeklyDemand: number;
  avgMonthlyDemand: number;
  movingAvg7d: number;
  movingAvg30d: number;
  stdDeviation: number;
  coefficientOfVariation: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  totalQuantitySold: number;
  totalRevenue: number;
  currentStock: number;
}

interface SeasonalityData {
  monthlyData: { month: number; avgQuantity: number; deviation: number }[];
  peakMonths: number[];
  troughMonths: number[];
  isHighlySeasonalCV: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ProductDemandPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [demand, setDemand] = useState<DemandDetail | null>(null);
  const [seasonality, setSeasonality] = useState<SeasonalityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [demandRes, seasonRes] = await Promise.all([
          fetch(`/api/analytics/demand/${productId}`),
          fetch(`/api/analytics/demand/${productId}/seasonality`),
        ]);
        if (demandRes.ok) setDemand(await demandRes.json());
        if (seasonRes.ok) setSeasonality(await seasonRes.json());
      } catch (err) {
        console.error('Failed to fetch demand detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="w-48 h-8 rounded bg-foreground/[0.06] skeleton-shimmer" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-foreground/[0.06] skeleton-shimmer" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-foreground/[0.06] skeleton-shimmer" />
      </div>
    );
  }

  if (!demand) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found or no demand data available.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const TrendIcon = demand.trend === 'UP' ? TrendingUp : demand.trend === 'DOWN' ? TrendingDown : Minus;
  const trendColor = demand.trend === 'UP' ? 'text-green-500' : demand.trend === 'DOWN' ? 'text-red-500' : 'text-muted-foreground';
  const daysOfSupply = demand.avgDailyDemand > 0 ? Math.round(demand.currentStock / demand.avgDailyDemand) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-black tracking-tight font-heading">{demand.productName}</h1>
          <p className="text-sm text-muted-foreground">{demand.sku || 'No SKU'}</p>
        </div>
        <Badge variant={demand.trend === 'UP' ? 'default' : demand.trend === 'DOWN' ? 'destructive' : 'secondary'} className="ml-auto gap-1">
          <TrendIcon className="w-3.5 h-3.5" />
          {demand.trend}
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Daily</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">{demand.avgDailyDemand}</p>
            <p className="text-xs text-muted-foreground mt-1">units/day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">{demand.avgMonthlyDemand}</p>
            <p className="text-xs text-muted-foreground mt-1">units/month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-black ${demand.currentStock <= 0 ? 'text-destructive' : ''}`}>{demand.currentStock}</p>
            {daysOfSupply !== null && (
              <p className="text-xs text-muted-foreground mt-1">{daysOfSupply} days supply</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">CV (Variability)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">{demand.coefficientOfVariation}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {demand.coefficientOfVariation < 0.5 ? 'Stable (X)' : demand.coefficientOfVariation < 1 ? 'Variable (Y)' : 'Erratic (Z)'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">MA-7d</p>
            <p className="text-lg font-bold">{demand.movingAvg7d}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">MA-30d</p>
            <p className="text-lg font-bold">{demand.movingAvg30d}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Std Deviation</p>
            <p className="text-lg font-bold">{demand.stdDeviation}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Sold</p>
            <p className="text-lg font-bold">{demand.totalQuantitySold}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(demand.totalRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demand Chart Placeholder */}
      <DemandChart title="Daily Demand (last 90 days)" data={[]} />

      {/* Seasonality */}
      {seasonality && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Seasonality Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2">
              {seasonality.monthlyData.map((m) => {
                const isPeak = seasonality.peakMonths.includes(m.month);
                const isTrough = seasonality.troughMonths.includes(m.month);
                return (
                  <div key={m.month} className="text-center">
                    <div
                      className={`h-16 rounded-md flex items-end justify-center pb-1 text-[10px] font-bold ${
                        isPeak ? 'bg-green-500/20 text-green-600' :
                        isTrough ? 'bg-red-500/20 text-red-600' :
                        'bg-muted text-muted-foreground'
                      }`}
                      style={{ height: `${Math.max(20, (m.avgQuantity / Math.max(...seasonality.monthlyData.map(d => d.avgQuantity), 1)) * 64)}px` }}
                    >
                      {Math.round(m.avgQuantity)}
                    </div>
                    <p className="text-[10px] mt-1 text-muted-foreground">{MONTH_NAMES[m.month - 1]}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <span>Seasonal CV: <strong>{seasonality.isHighlySeasonalCV}</strong></span>
              {seasonality.peakMonths.length > 0 && (
                <span>Peak: <strong>{seasonality.peakMonths.map(m => MONTH_NAMES[m - 1]).join(', ')}</strong></span>
              )}
              {seasonality.troughMonths.length > 0 && (
                <span>Trough: <strong>{seasonality.troughMonths.map(m => MONTH_NAMES[m - 1]).join(', ')}</strong></span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
