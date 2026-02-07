'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  RefreshCw,
  MapPin,
  Package,
  ArrowUpDown,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface LocationAllocation {
  locationId: string;
  locationName: string;
  currentQty: number;
  demandShare: number;
  recommendedQty: number;
  delta: number;
}

interface Recommendation {
  productId: string;
  productName: string;
  sku: string | null;
  totalStock: number;
  totalDemand: number;
  locations: LocationAllocation[];
  imbalanceScore: number;
}

interface Dashboard {
  recommendations: Recommendation[];
  summary: {
    productsAnalyzed: number;
    imbalancedProducts: number;
    totalRecommendedMoves: number;
    avgImbalanceScore: number;
  };
}

// ============================================================
// Helpers
// ============================================================

const PERIOD_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

function getScoreColor(score: number) {
  if (score >= 60) return 'text-red-500';
  if (score >= 30) return 'text-amber-500';
  return 'text-green-500';
}

function getScoreBg(score: number) {
  if (score >= 60) return 'bg-red-500/10 border-red-500/20';
  if (score >= 30) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-green-500/10 border-green-500/20';
}

// ============================================================
// Main Page
// ============================================================

export default function PlacementOptimizerPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(90);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const fetchData = useCallback(async (period: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/placement-optimizer?lookbackDays=${period}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch placement data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  const statCards = [
    {
      label: 'Products Analyzed',
      value: data?.summary.productsAnalyzed ?? 0,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Imbalanced',
      value: data?.summary.imbalancedProducts ?? 0,
      icon: ArrowUpDown,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Moves Recommended',
      value: data?.summary.totalRecommendedMoves ?? 0,
      icon: MapPin,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Avg Imbalance',
      value: data?.summary.avgImbalanceScore ?? 0,
      icon: BarChart3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10">
            <MapPin className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">
              Placement Optimizer
            </h1>
            <p className="text-sm text-muted-foreground">
              Optimize SKU allocation across warehouses based on demand
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-foreground/[0.06] rounded-lg p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  days === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(days)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p
                    className={`text-2xl font-bold mt-1 ${isLoading ? 'animate-pulse' : ''}`}
                  >
                    {isLoading ? '...' : card.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Placement Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Analyzing stock distribution...
            </div>
          ) : (data?.recommendations.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <MapPin className="w-8 h-8 opacity-50" />
              <p>No imbalances detected.</p>
              <p className="text-xs">
                Stock is well-distributed across your locations, or you have fewer
                than 2 locations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Total Stock</TableHead>
                    <TableHead className="text-right">Total Demand</TableHead>
                    <TableHead className="text-right">Imbalance</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.recommendations.map((rec) => (
                    <React.Fragment key={rec.productId}>
                      <TableRow
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() =>
                          setExpandedProduct(
                            expandedProduct === rec.productId ? null : rec.productId,
                          )
                        }
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{rec.productName}</p>
                            {rec.sku && (
                              <p className="text-xs text-muted-foreground">
                                {rec.sku}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {rec.totalStock}
                        </TableCell>
                        <TableCell className="text-right">
                          {rec.totalDemand}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={`${getScoreBg(rec.imbalanceScore)} ${getScoreColor(rec.imbalanceScore)}`}
                          >
                            {rec.imbalanceScore}%
                          </Badge>
                        </TableCell>
                        <TableCell>{rec.locations.length} locations</TableCell>
                        <TableCell>
                          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                      {expandedProduct === rec.productId && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30 p-4">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Per-Location Allocation
                              </p>
                              <div className="grid gap-2">
                                {rec.locations.map((loc) => (
                                  <div
                                    key={loc.locationId}
                                    className="flex items-center gap-4 p-2 rounded-lg bg-background"
                                  >
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {loc.locationName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {loc.demandShare}% of demand
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm">
                                        Current: <strong>{loc.currentQty}</strong>
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm">
                                        Optimal: <strong>{loc.recommendedQty}</strong>
                                      </p>
                                    </div>
                                    <div className="min-w-[80px] text-right">
                                      {loc.delta > 0 ? (
                                        <span className="text-green-500 text-sm font-medium flex items-center justify-end gap-1">
                                          <ArrowUp className="w-3 h-3" />+{loc.delta}
                                        </span>
                                      ) : loc.delta < 0 ? (
                                        <span className="text-red-500 text-sm font-medium flex items-center justify-end gap-1">
                                          <ArrowDown className="w-3 h-3" />{loc.delta}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground text-sm flex items-center justify-end gap-1">
                                          <Minus className="w-3 h-3" />0
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
