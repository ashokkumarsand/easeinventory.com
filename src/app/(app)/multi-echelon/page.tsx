'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Layers,
  Building2,
  AlertTriangle,
  ArrowUpDown,
  TrendingUp,
  Package,
  Loader2,
  ChevronDown,
  ChevronRight,
  IndianRupee,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================
// Types
// ============================================================

interface LocationBreakdown {
  locationId: string;
  locationName: string;
  currentStock: number;
  demandRate: number;
  daysOfSupply: number;
  optimalStock: number;
  delta: number;
  serviceLevel: number;
}

interface SkuAnalysis {
  productId: string;
  productName: string;
  sku: string | null;
  totalStock: number;
  totalDemand: number;
  locations: LocationBreakdown[];
  networkImbalance: number;
  recommendation: string;
}

interface NetworkHealthEntry {
  locationId: string;
  locationName: string;
  type: string;
  overStocked: number;
  underStocked: number;
  balanced: number;
  utilizationPct: number;
}

interface EchelonDashboard {
  summary: {
    totalLocations: number;
    totalSkusAnalyzed: number;
    imbalancedSkus: number;
    avgNetworkImbalance: number;
    totalRecommendedMoves: number;
    potentialSavings: number;
  };
  skuAnalysis: SkuAnalysis[];
  networkHealth: NetworkHealthEntry[];
}

// ============================================================
// Helpers
// ============================================================

const LOOKBACK_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '180 days' },
];

function getImbalanceColor(score: number) {
  if (score > 30) return 'text-red-500';
  if (score >= 15) return 'text-amber-500';
  return 'text-green-500';
}

function getImbalanceBg(score: number) {
  if (score > 30) return 'bg-red-500/10 border-red-500/20';
  if (score >= 15) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-green-500/10 border-green-500/20';
}

function getUtilizationColor(pct: number) {
  if (pct >= 90) return 'text-red-500';
  if (pct >= 70) return 'text-amber-500';
  return 'text-green-500';
}

function formatCurrency(value: number) {
  return `\u20B9${value.toLocaleString()}`;
}

// ============================================================
// Main Page
// ============================================================

export default function MultiEchelonPage() {
  const [data, setData] = useState<EchelonDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lookbackDays, setLookbackDays] = useState('90');
  const [expandedSku, setExpandedSku] = useState<string | null>(null);

  const fetchData = useCallback(async (days: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/multi-echelon?lookbackDays=${days}`);
      if (!res.ok) {
        throw new Error('Failed to fetch multi-echelon data');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch multi-echelon data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(lookbackDays);
  }, [lookbackDays, fetchData]);

  const summary = data?.summary;

  const statCards = [
    {
      label: 'Total Locations',
      value: summary?.totalLocations ?? 0,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'SKUs Analyzed',
      value: summary?.totalSkusAnalyzed ?? 0,
      icon: Package,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Imbalanced SKUs',
      value: summary?.imbalancedSkus ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Avg Network Imbalance',
      value: summary?.avgNetworkImbalance ?? 0,
      icon: ArrowUpDown,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      format: (v: number) => `${v}%`,
    },
    {
      label: 'Recommended Moves',
      value: summary?.totalRecommendedMoves ?? 0,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Potential Savings',
      value: summary?.potentialSavings ?? 0,
      icon: IndianRupee,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      format: (v: number) => formatCurrency(v),
    },
  ];

  // Error state
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertTriangle className="w-10 h-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchData(lookbackDays)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10">
            <Layers className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">
              Multi-Echelon Optimization
            </h1>
            <p className="text-sm text-muted-foreground">
              Optimize inventory distribution across your warehouse network
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={lookbackDays} onValueChange={setLookbackDays}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Lookback" />
            </SelectTrigger>
            <SelectContent>
              {LOOKBACK_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(lookbackDays)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Layers className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading multi-echelon analysis...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((card) => (
              <Card key={card.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                        {card.label}
                      </p>
                      <p
                        className={`text-2xl font-black mt-1 ${loading ? 'animate-pulse' : ''}`}
                      >
                        {loading ? '...' : card.format(card.value)}
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

          <Separator />

          {/* Network Health Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Network Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {(data?.networkHealth.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Building2 className="w-8 h-8 opacity-50" />
                  <p>No locations to analyze.</p>
                  <p className="text-xs">
                    Network health requires at least 2 active locations.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Over-stocked</TableHead>
                        <TableHead className="text-right">Under-stocked</TableHead>
                        <TableHead className="text-right">Balanced</TableHead>
                        <TableHead className="text-right">Utilization %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.networkHealth.map((loc) => (
                        <TableRow key={loc.locationId}>
                          <TableCell className="font-medium">{loc.locationName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {loc.type.toLowerCase().replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {loc.overStocked > 0 ? (
                              <span className="text-red-500 font-medium">
                                {loc.overStocked}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {loc.underStocked > 0 ? (
                              <span className="text-amber-500 font-medium">
                                {loc.underStocked}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-green-500 font-medium">
                              {loc.balanced}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`font-medium ${getUtilizationColor(loc.utilizationPct)}`}
                            >
                              {loc.utilizationPct}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SKU Analysis Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                SKU Analysis
                {data && data.skuAnalysis.length > 0 && (
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    (Top {data.skuAnalysis.length} imbalanced)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {(data?.skuAnalysis.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Package className="w-8 h-8 opacity-50" />
                  <p>No SKU data available.</p>
                  <p className="text-xs">
                    SKU analysis requires products stocked across multiple locations.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8" />
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Total Stock</TableHead>
                        <TableHead className="text-right">Total Demand</TableHead>
                        <TableHead className="text-right">Network Imbalance</TableHead>
                        <TableHead>Recommendation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.skuAnalysis.map((sku) => (
                        <React.Fragment key={sku.productId}>
                          <TableRow
                            className="cursor-pointer hover:bg-accent/50"
                            onClick={() =>
                              setExpandedSku(
                                expandedSku === sku.productId ? null : sku.productId
                              )
                            }
                          >
                            <TableCell className="w-8">
                              {expandedSku === sku.productId ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{sku.productName}</p>
                                {sku.sku && (
                                  <p className="text-xs text-muted-foreground">
                                    {sku.sku}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {sku.totalStock.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {sku.totalDemand.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="outline"
                                className={`${getImbalanceBg(sku.networkImbalance)} ${getImbalanceColor(sku.networkImbalance)}`}
                              >
                                {sku.networkImbalance}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <p className="text-xs text-muted-foreground max-w-[300px] truncate">
                                {sku.recommendation}
                              </p>
                            </TableCell>
                          </TableRow>

                          {/* Expanded Per-Location Breakdown */}
                          {expandedSku === sku.productId && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/30 p-4">
                                <div className="space-y-3">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                    Per-Location Breakdown
                                  </p>
                                  <div className="grid gap-2">
                                    {sku.locations.map((loc) => (
                                      <div
                                        key={loc.locationId}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-background"
                                      >
                                        <div className="flex-1 min-w-[120px]">
                                          <p className="text-sm font-medium">
                                            {loc.locationName}
                                          </p>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                            Current
                                          </p>
                                          <p className="text-sm font-medium">
                                            {loc.currentStock.toLocaleString()}
                                          </p>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                            Optimal
                                          </p>
                                          <p className="text-sm font-medium">
                                            {loc.optimalStock.toLocaleString()}
                                          </p>
                                        </div>
                                        <div className="text-right min-w-[70px]">
                                          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                            Delta
                                          </p>
                                          <div className="flex items-center justify-end gap-1">
                                            {loc.delta > 0 ? (
                                              <span className="text-amber-500 text-sm font-medium flex items-center gap-0.5">
                                                <ArrowUp className="w-3 h-3" />
                                                +{loc.delta.toLocaleString()}
                                              </span>
                                            ) : loc.delta < 0 ? (
                                              <span className="text-red-500 text-sm font-medium flex items-center gap-0.5">
                                                <ArrowDown className="w-3 h-3" />
                                                {loc.delta.toLocaleString()}
                                              </span>
                                            ) : (
                                              <span className="text-muted-foreground text-sm flex items-center gap-0.5">
                                                <Minus className="w-3 h-3" />0
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                            Days of Supply
                                          </p>
                                          <p className="text-sm font-medium">
                                            {loc.daysOfSupply === 999
                                              ? 'N/A'
                                              : `${loc.daysOfSupply}d`}
                                          </p>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                            Service Level
                                          </p>
                                          <p
                                            className={`text-sm font-medium ${
                                              loc.serviceLevel >= 95
                                                ? 'text-green-500'
                                                : loc.serviceLevel >= 80
                                                  ? 'text-amber-500'
                                                  : 'text-red-500'
                                            }`}
                                          >
                                            {loc.serviceLevel}%
                                          </p>
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
        </>
      )}
    </motion.div>
  );
}
