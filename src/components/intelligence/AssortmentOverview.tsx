'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, BarChart3, TrendingUp, Lightbulb } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface OverviewData {
  totalProducts: number;
  avgScore: number;
  scoreDistribution: { bucket: string; count: number }[];
  lifecycleDistribution: Record<string, number>;
  topPerformers: { productName: string; score: number }[];
  bottomPerformers: { productName: string; score: number }[];
  suggestionsCount: Record<string, number>;
}

const LIFECYCLE_COLORS: Record<string, string> = {
  INTRODUCTION: '#3b82f6',
  GROWTH: '#22c55e',
  MATURITY: '#a855f7',
  DECLINE: '#f59e0b',
  END_OF_LIFE: '#ef4444',
};

const SCORE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

export function AssortmentOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/assortment');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Failed to fetch assortment overview:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading assortment overview...
      </div>
    );
  }

  if (!data) return null;

  const lifecycleData = Object.entries(data.lifecycleDistribution)
    .filter(([, count]) => count > 0)
    .map(([stage, count]) => ({ name: stage.replace('_', ' '), value: count, fill: LIFECYCLE_COLORS[stage] || '#888' }));

  const totalSuggestions = Object.values(data.suggestionsCount).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Package className="w-4 h-4" />
              Products Scored
            </div>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <BarChart3 className="w-4 h-4" />
              Avg Score
            </div>
            <div className="text-2xl font-bold">{data.avgScore}<span className="text-sm text-muted-foreground">/100</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              Top Performers
            </div>
            <div className="text-2xl font-bold">{data.scoreDistribution.find(b => b.bucket === '75-100')?.count ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Lightbulb className="w-4 h-4" />
              Suggestions
            </div>
            <div className="text-2xl font-bold">{totalSuggestions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.scoreDistribution}>
                <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Products" radius={[4, 4, 0, 0]}>
                  {data.scoreDistribution.map((_, i) => (
                    <Cell key={i} fill={SCORE_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lifecycle Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Product Lifecycle</CardTitle>
          </CardHeader>
          <CardContent>
            {lifecycleData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie data={lifecycleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                      {lifecycleData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5">
                  {lifecycleData.map(entry => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No lifecycle data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top/Bottom Performers */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topPerformers.length > 0 ? data.topPerformers.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="truncate mr-2">{p.productName}</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 shrink-0">{p.score}</Badge>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.bottomPerformers.length > 0 ? data.bottomPerformers.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="truncate mr-2">{p.productName}</span>
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 shrink-0">{p.score}</Badge>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
