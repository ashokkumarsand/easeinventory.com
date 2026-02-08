'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FolderOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface CategoryData {
  categoryName: string;
  breadth: number;
  avgDepth: number;
  totalRevenue: number;
  revenueShare: number;
  health: string;
  lowPerformerPct: number;
  avgScore: number;
}

function HealthBadge({ health }: { health: string }) {
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    OVER_ASSORTED: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: <AlertTriangle className="w-3 h-3" /> },
    UNDER_ASSORTED: { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: <AlertTriangle className="w-3 h-3" /> },
    BALANCED: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: <CheckCircle className="w-3 h-3" /> },
  };
  const { color, icon } = map[health] || { color: '', icon: null };
  return (
    <Badge variant="outline" className={`${color} gap-1`}>
      {icon}
      {health.replace('_', ' ')}
    </Badge>
  );
}

function formatCurrency(val: number): string {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toFixed(0);
}

export function CategoryAnalysis() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/assortment/categories');
      const json = await res.json();
      setCategories(json.categories || []);
    } catch (e) {
      console.error('Failed to fetch category analysis:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Analyzing categories...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FolderOpen className="w-10 h-10 mb-3 opacity-50" />
          <p className="font-medium">No category data</p>
          <p className="text-sm mt-1">Categorize your products to see assortment analysis</p>
        </CardContent>
      </Card>
    );
  }

  const scatterData = categories.map(c => ({
    name: c.categoryName,
    x: c.breadth,
    y: c.avgScore,
    size: c.totalRevenue,
  }));

  return (
    <div className="space-y-6">
      {/* Scatter Chart: Breadth vs Avg Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Category Breadth vs. Avg Score</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="x" name="SKU Count" tick={{ fontSize: 12 }} label={{ value: 'SKU Count', position: 'bottom', offset: -5, fontSize: 12 }} />
              <YAxis dataKey="y" name="Avg Score" tick={{ fontSize: 12 }} label={{ value: 'Avg Score', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-popover border rounded-lg p-2 text-sm shadow-md">
                      <div className="font-medium">{d.name}</div>
                      <div>SKUs: {d.x}</div>
                      <div>Avg Score: {d.y}</div>
                    </div>
                  );
                }}
              />
              <Scatter data={scatterData} fill="hsl(var(--primary))" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <Card key={cat.categoryName}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium truncate">{cat.categoryName}</CardTitle>
                <HealthBadge health={cat.health} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">SKUs</span>
                  <div className="font-medium">{cat.breadth}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Depth</span>
                  <div className="font-medium">{cat.avgDepth} units</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Revenue</span>
                  <div className="font-medium">{formatCurrency(cat.totalRevenue)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Rev Share</span>
                  <div className="font-medium">{(cat.revenueShare * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Score</span>
                  <div className="font-medium">{cat.avgScore}/100</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Low Perf.</span>
                  <div className="font-medium">{(cat.lowPerformerPct * 100).toFixed(0)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
